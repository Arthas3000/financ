"""Sintetizador chiptune (estilo 16-bit) em numpy: ondas quadradas com largura de pulso
variável, triângulo para o baixo, ruído para bateria, envelopes ADSR, vibrato e eco.
Inclui um mini-"tracker" que lê melodias escritas em texto."""

import wave
import numpy as np

SR = 22050  # taxa de amostragem (Hz)
NOTAS = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6,
         'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def midi(nome):
    """'A4' → 69."""
    letra, oitava = nome[:-1], int(nome[-1])
    return 12 * (oitava + 1) + NOTAS[letra]


def freq(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tempo(n):
    return np.arange(int(n)) / SR


# ── Osciladores ──
def pulso(f, dur, duty=0.5, vibrato=0.0, vib_atraso=0.12, f_fim=None):
    t = tempo(dur * SR)
    fr = np.full_like(t, f) if f_fim is None else np.linspace(f, f_fim, len(t))
    if vibrato:
        fr = fr * (1 + vibrato * np.sin(2 * np.pi * 6 * t) * np.clip((t - vib_atraso) * 8, 0, 1))
    fase = np.cumsum(fr) / SR
    return np.where((fase % 1.0) < duty, 1.0, -1.0)


def triangulo(f, dur, f_fim=None, quantizar=True):
    t = tempo(dur * SR)
    fr = np.full_like(t, f) if f_fim is None else np.linspace(f, f_fim, len(t))
    fase = np.cumsum(fr) / SR % 1.0
    onda = 4 * np.abs(fase - 0.5) - 1
    return np.round(onda * 7.5) / 7.5 if quantizar else onda  # 4 bits, como no NES


def serra(f, dur, f_fim=None):
    t = tempo(dur * SR)
    fr = np.full_like(t, f) if f_fim is None else np.linspace(f, f_fim, len(t))
    return (np.cumsum(fr) / SR % 1.0) * 2 - 1


def seno(f, dur, f_fim=None):
    t = tempo(dur * SR)
    fr = np.full_like(t, f) if f_fim is None else np.geomspace(f, f_fim, len(t))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR)


def ruido(dur, taxa=SR, semente=1):
    """Ruído "sample and hold": taxa menor = ruído mais grave (como o canal de ruído do NES)."""
    rnd = np.random.default_rng(semente)
    n = int(dur * SR)
    passo = max(1, int(SR / taxa))
    valores = rnd.uniform(-1, 1, n // passo + 2)
    return np.repeat(valores, passo)[:n]


# ── Envelopes e filtros ──
def adsr(n, a=0.005, d=0.05, s=0.7, r=0.03):
    n = int(n)
    env = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    env[:na] = np.linspace(0, 1, na) if na else env[:na]
    fim_d = min(n, na + nd)
    env[na:fim_d] = np.linspace(1, s, fim_d - na)
    if nr and n > nr:
        env[-nr:] *= np.linspace(1, 0, nr)
    return env


def decaimento(n, tau):
    return np.exp(-tempo(n) / tau)


def passa_baixa(x, corte):
    """Filtro de um polo (suaviza ruído/agudos)."""
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def eco(x, atraso=0.18, retorno=0.3, repeticoes=3):
    y = x.copy()
    n = int(atraso * SR)
    for k in range(1, repeticoes + 1):
        if n * k >= len(x):
            break
        y[n * k:] += x[:-n * k] * (retorno ** k)
    return y


def normalizar(x, pico=0.89):
    x = np.tanh(x * 1.2)  # saturação suave: dá "peso" de fliperama sem estourar
    m = np.max(np.abs(x)) or 1
    return x / m * pico


def salvar_wav(caminho, x):
    dados = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(str(caminho), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(dados.tobytes())


# ── Bateria ──
def bumbo():
    n = int(0.16 * SR)
    return seno(150, 0.16, 42) * decaimento(n, 0.05) + ruido(0.16, 4000) * decaimento(n, 0.006) * 0.4


def caixa():
    n = int(0.14 * SR)
    return ruido(0.14, 11000, 3) * decaimento(n, 0.04) * 0.8 + triangulo(190, 0.14) * decaimento(n, 0.03) * 0.5


def chimbal():
    n = int(0.05 * SR)
    return ruido(0.05, SR, 7) * decaimento(n, 0.012) * 0.5


def prato():
    n = int(0.5 * SR)
    return ruido(0.5, SR, 9) * decaimento(n, 0.15) * 0.4


BATERIA = {'k': bumbo, 's': caixa, 'h': chimbal, 'c': prato}


# ── Mini-tracker ──
def ler_sequencia(texto):
    """'A4:2 C5:2 .:4' → [(69, 2), (72, 2), (None, 4)]. Duração em semicolcheias (16 avos)."""
    eventos = []
    for tok in texto.split():
        nome, _, dur = tok.partition(':')
        eventos.append((None if nome == '.' else midi(nome), int(dur or 1)))
    return eventos


def renderizar_voz(eventos, passo, total, timbre):
    """Renderiza uma voz melódica num buffer de `total` amostras (+ cauda)."""
    buf = np.zeros(total + SR)
    pos = 0
    for nota, dur in eventos:
        n = int(dur * passo * SR)
        if nota is not None:
            buf[pos:pos + n] += timbre(freq(nota), dur * passo)[:n]
        pos += n
    return buf


def renderizar_bateria(padrao, passo, total):
    buf = np.zeros(total + SR)
    for i, ch in enumerate(padrao):
        if ch in BATERIA:
            som = BATERIA[ch]()
            p = int(i * passo * SR)
            buf[p:p + len(som)] += som[:len(buf) - p]
    return buf


def mixar(canais, total, loop=True):
    """Soma os canais; em loops, a cauda que passa do fim volta para o começo (emenda perfeita)."""
    mix = sum(canais)
    if loop:
        cauda = mix[total:]
        mix = mix[:total].copy()
        mix[:len(cauda)] += cauda[:total]
    else:
        # mantém a cauda (o fim da vinheta soa natural)
        ultimo = np.nonzero(np.abs(mix) > 1e-4)[0]
        mix = mix[:(ultimo[-1] + 1) if len(ultimo) else total]
    return normalizar(mix)
