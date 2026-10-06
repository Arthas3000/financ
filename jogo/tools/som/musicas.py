"""Trilha sonora composta em texto (1 compasso = 16 semicolcheias).

Instrumentação de fliperama: melodia em onda quadrada 25% (dobrada uma oitava abaixo para
ganhar corpo), arpejos rápidos em 12,5%, baixo em triângulo e bateria de ruído."""

import numpy as np
from . import sintetizador as s

# Acordes → notas (fundamental, terça, quinta) em semitons.
QUALIDADE = {'': (0, 4, 7), 'm': (0, 3, 7)}


def _acorde(nome):
    """'Am' → (9, menor); 'A#' → (10, maior)."""
    if nome.endswith('m'):
        return s.NOTAS[nome[:-1]], QUALIDADE['m']
    return s.NOTAS[nome], QUALIDADE['']


def baixo(acordes, oitava=2, padrao=(0, 0, 12, 0, 0, 12, 0, 12)):
    """Baixo em colcheias com saltos de oitava (bem "pra frente")."""
    eventos = []
    for a in acordes:
        raiz, _ = _acorde(a)
        base = 12 * (oitava + 1) + raiz
        eventos += [(base + p, 2) for p in padrao]
    return eventos


def arpejo(acordes, oitava=4, ordem=(0, 1, 2, 1)):
    eventos = []
    for a in acordes:
        raiz, intervalos = _acorde(a)
        base = 12 * (oitava + 1) + raiz
        notas = [base + intervalos[i] for i in ordem]
        eventos += [(notas[k % len(notas)], 1) for k in range(16)]
    return eventos


# ── Timbres ──
def lider(f, dur):
    n = int(dur * s.SR)
    corpo = s.pulso(f, dur, 0.25, vibrato=0.012) * 0.75 + s.pulso(f / 2, dur, 0.5) * 0.25
    return corpo * s.adsr(n, 0.004, 0.08, 0.75, min(0.04, dur / 3))


def harmonia(f, dur):
    n = int(dur * s.SR)
    return s.pulso(f, dur, 0.125) * s.adsr(n, 0.002, 0.04, 0.4, 0.01)


def baixo_timbre(f, dur):
    n = int(dur * s.SR)
    return s.triangulo(f, dur) * s.adsr(n, 0.002, 0.02, 0.9, 0.01)


def sino(f, dur):
    n = int(dur * s.SR)
    return (s.pulso(f, dur, 0.5) * 0.6 + s.seno(f * 2, dur) * 0.4) * s.decaimento(n, 0.35)


def musica(bpm, melodia, acordes, bateria, loop=True, volumes=(0.32, 0.10, 0.42, 0.38), timbre_melodia=lider,
           baixo_padrao=(0, 0, 12, 0, 0, 12, 0, 12), compassos=None):
    passo = 60 / bpm / 4
    compassos = compassos or len(acordes)
    total = int(compassos * 16 * passo * s.SR)
    mel = s.ler_sequencia(' '.join(melodia))
    v_mel, v_harm, v_baixo, v_bat = volumes
    canais = [
        s.eco(s.renderizar_voz(mel, passo, total, timbre_melodia), atraso=passo * 3, retorno=0.22) * v_mel,
        s.renderizar_voz(arpejo(acordes), passo, total, harmonia) * v_harm,
        s.renderizar_voz(baixo(acordes, padrao=baixo_padrao), passo, total, baixo_timbre) * v_baixo,
        s.renderizar_bateria(''.join(bateria), passo, total) * v_bat,
    ]
    return s.mixar(canais, total, loop)


ROCK = 'k.h.s.hkk.h.s.h.'
VIRADA = 'k.s.s.s.sssscs.s'


def titulo():
    acordes = ['Am', 'F', 'G', 'E'] * 2 + ['F', 'G', 'Am', 'Am', 'F', 'G', 'E', 'E']
    melodia = [
        'A4:2 C5:2 E5:4 D5:2 C5:2 B4:2 C5:2', 'A4:6 F4:2 A4:2 C5:2 F5:4', 'G5:4 F5:2 E5:2 D5:4 B4:2 G4:2',
        'E5:8 G#4:4 B4:4', 'A5:4 G5:2 E5:2 A5:4 B5:2 C6:2', 'C6:4 B5:2 A5:2 F5:4 A5:4',
        'B5:4 A5:2 G5:2 D5:4 G5:4', 'G#5:4 B5:4 E6:8',
        'F5:2 F5:2 .:2 F5:2 E5:2 F5:2 A5:4', 'G5:2 G5:2 .:2 G5:2 F5:2 G5:2 B5:4', 'C6:4 B5:2 A5:2 E5:4 A5:4',
        'A5:12 .:4', 'A5:4 G5:2 F5:2 C5:4 F5:4', 'B5:4 A5:2 G5:2 D5:4 G5:4', 'G#5:2 A5:2 B5:4 D6:4 C6:2 B5:2',
        'B5:8 E5:4 G#5:4',
    ]
    bateria = [ROCK] * 7 + [VIRADA] + [ROCK] * 7 + [VIRADA]
    return musica(150, melodia, acordes, bateria)


def selecao():
    acordes = ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B']
    melodia = [
        'E5:2 .:2 E5:2 .:2 G5:4 F#5:2 E5:2', 'B4:4 .:4 B4:2 D5:2 E5:4', 'G5:4 E5:4 C5:4 E5:4',
        'F#5:4 D5:4 A4:4 D5:4', 'E5:2 .:2 E5:2 .:2 G5:4 A5:2 B5:2', 'B5:8 A5:4 G5:4',
        'E5:4 G5:4 C6:4 B5:4', 'A5:4 F#5:4 D#5:8',
    ]
    bateria = ['k.hhs.hhk.hhs.hh'] * 7 + ['k.hhs.hhs.s.sscs']
    return musica(140, melodia, acordes, bateria, baixo_padrao=(0, 0, 0, 12, 0, 0, 12, 0))


def fase1():
    acordes = ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D', 'Em', 'C', 'G', 'D', 'Em', 'C', 'D', 'D']
    melodia = [
        'D5:2 G5:2 B5:4 A5:2 G5:2 D5:4', 'F#5:2 A5:2 D6:4 C6:2 A5:2 F#5:4', 'G5:2 B5:2 E6:4 D6:2 B5:2 G5:4',
        'E5:4 G5:4 C6:4 B5:2 A5:2', 'B5:4 A5:2 G5:2 D5:4 G5:4', 'A5:4 G5:2 F#5:2 D5:8',
        'E5:2 G5:2 C6:4 B5:2 A5:2 G5:4', 'F#5:4 A5:4 D6:8',
        'E5:2 .:2 E5:2 G5:2 B5:4 A5:4', 'G5:2 .:2 G5:2 E5:2 C5:4 E5:4', 'D5:2 .:2 D5:2 G5:2 B5:4 D6:4',
        'C6:4 B5:4 A5:8', 'B5:4 G5:2 B5:2 E6:4 D6:4', 'C6:4 B5:2 A5:2 G5:4 E5:4',
        'F#5:2 G5:2 A5:2 B5:2 C6:2 D6:2 E6:2 F#6:2', 'D6:8 .:4 D5:4',
    ]
    bateria = [ROCK] * 7 + [VIRADA] + [ROCK] * 7 + [VIRADA]
    return musica(145, melodia, acordes, bateria)


def fase2():
    acordes = ['Dm', 'Dm', 'A#', 'C', 'Dm', 'Dm', 'A#', 'A', 'Gm', 'Gm', 'Dm', 'Dm', 'A#', 'C', 'A', 'A']
    melodia = [
        'D5:2 F5:2 A5:2 D6:2 C6:2 A5:2 F5:2 A5:2', 'D6:6 C6:2 A5:4 F5:4', 'F5:2 A#5:2 D6:4 C6:2 A#5:2 F5:4',
        'G5:2 C6:2 E6:4 D6:2 C6:2 G5:4', 'D5:2 F5:2 A5:2 D6:2 C6:2 A5:2 F5:2 A5:2', 'D6:4 E6:2 F6:2 E6:4 D6:4',
        'D6:4 C6:2 A#5:2 F5:4 D6:4', 'C#6:4 E6:4 A6:8',
        'G5:2 .:2 G5:2 A#5:2 D6:4 C6:4', 'A#5:4 A5:2 G5:2 D5:8', 'F5:2 .:2 F5:2 A5:2 D6:4 C6:4',
        'A5:4 G5:2 F5:2 D5:8', 'A#5:4 C6:2 D6:2 F6:4 D6:4', 'E6:4 D6:2 C6:2 G5:4 C6:4',
        'C#6:2 D6:2 E6:2 F6:2 E6:2 D6:2 C#6:2 A5:2', 'A5:8 E5:4 C#5:4',
    ]
    agitado = 'k.hks.hkk.hks.hk'
    bateria = [agitado] * 7 + [VIRADA] + [agitado] * 7 + [VIRADA]
    return musica(155, melodia, acordes, bateria, baixo_padrao=(0, 12, 0, 12, 0, 12, 0, 12))


def final():
    acordes = ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C']
    melodia = [
        'E5:4 G5:4 C6:6 B5:2', 'D6:4 B5:4 G5:8', 'C6:4 B5:2 A5:2 E5:8', 'F5:4 A5:4 C6:4 A5:4',
        'G5:4 E5:4 C6:6 D6:2', 'D6:4 E6:2 D6:2 B5:8', 'A5:4 C6:4 F6:4 E6:2 D6:2', 'C6:12 .:4',
    ]
    bateria = ['k...h...s...h...'] * 8
    return musica(118, melodia, acordes, bateria, timbre_melodia=sino, volumes=(0.4, 0.08, 0.38, 0.25),
                  baixo_padrao=(0, 7, 12, 7, 0, 7, 12, 7))


def vitoria():
    melodia = ['C5:2 E5:2 G5:2 C6:6 A#5:2 C6:2', '.:2 D6:2 E6:12']
    return musica(160, melodia, ['C', 'C'], ['k.k.k.s.....s.s.', 'k...........c...'], loop=False,
                  baixo_padrao=(0, 0, 0, 0, 0, 0, 0, 0))


def game_over():
    passo = 60 / 100 / 4
    mel = s.ler_sequencia('E5:4 D#5:4 D5:4 C#5:4 C5:6 B4:2 A4:12')
    bx = s.ler_sequencia('A2:8 G#2:8 G2:4 F2:4 E2:4 A1:8')
    total = int(36 * passo * s.SR)
    canais = [s.renderizar_voz(mel, passo, total, lider) * 0.4,
              s.renderizar_voz(bx, passo, total, baixo_timbre) * 0.45]
    return s.mixar(canais, total, loop=False)


MUSICAS = {'titulo': titulo, 'selecao': selecao, 'fase1': fase1, 'fase2': fase2, 'final': final,
           'vitoria': vitoria, 'game_over': game_over}
