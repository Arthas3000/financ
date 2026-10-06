"""Efeitos sonoros sintetizados (menus finais + jogo provisório)."""

import numpy as np
from . import sintetizador as s


def _env(x, tau):
    return x * s.decaimento(len(x), tau)


def _seq(*partes):
    return np.concatenate(partes)


def ui_mover():
    return _env(s.pulso(1320, 0.05, 0.5), 0.03)


def ui_confirmar():
    return _seq(*[_env(s.pulso(f, 0.05, 0.25), 0.05) for f in (660, 990, 1320)], _env(s.pulso(1760, 0.12, 0.25), 0.05))


def ui_voltar():
    return _env(s.pulso(660, 0.12, 0.5, f_fim=330), 0.06)


def ui_ficha():
    # O clássico "plim-plim" de moeda: B5 curto e E6 longo.
    return _seq(_env(s.pulso(988, 0.07, 0.5), 0.2), _env(s.pulso(1319, 0.45, 0.5), 0.15))


def ui_tique():
    return _env(s.pulso(1600, 0.035, 0.5), 0.01)


def ui_pronto():
    acorde = sum(s.pulso(s.freq(m), 0.7, 0.25) for m in (s.midi('A3'), s.midi('E4'), s.midi('A4'), s.midi('C#5')))
    subida = s.pulso(220, 0.7, 0.5, f_fim=880) * 0.4
    estouro = s.ruido(0.7, 9000) * s.decaimento(int(0.7 * s.SR), 0.08)
    return _env(acorde * 0.4 + subida + estouro, 0.25)


def ui_anuncio():
    n = int(0.5 * s.SR)
    vento = s.passa_baixa(s.ruido(0.5, s.SR), 3000) * np.sin(np.linspace(0, np.pi, n)) * 1.5
    return vento + _env(s.pulso(220, 0.5, 0.25, f_fim=660), 0.25) * 0.5


def pulo():
    return _env(s.pulso(280, 0.13, 0.5, f_fim=720), 0.08)


def aterrissar():
    return _env(s.passa_baixa(s.ruido(0.08, 3000), 900), 0.03) * 1.5


def sabre_ataque():
    # Motosserra: serra grave com modulação de amplitude rápida + ruído.
    dur = 0.32
    n = int(dur * s.SR)
    t = s.tempo(n)
    motor = s.serra(95, dur, f_fim=150) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 38 * t)))
    corrente = s.passa_baixa(s.ruido(dur, 8000), 2500) * 0.6
    return (motor + corrente) * s.adsr(n, 0.01, 0.05, 0.8, 0.08)


def sabre_acerto():
    dur = 0.16
    n = int(dur * s.SR)
    t = s.tempo(n)
    return _env(s.serra(240, dur) * (np.sin(2 * np.pi * 60 * t) > 0) + s.ruido(dur, 12000) * 0.7, 0.08)


def arremesso():
    n = int(0.16 * s.SR)
    return s.passa_baixa(s.ruido(0.16, s.SR), 2500) * np.sin(np.linspace(0, np.pi, n)) * 1.6


def ferramenta_quica():
    dur = 0.2
    return _env(sum(s.seno(f, dur) * a for f, a in ((2350, 0.6), (3720, 0.4), (5130, 0.3))), 0.05)


def ferramenta_acerto():
    return _env(s.seno(700, 0.14, 180), 0.06) * 1.2 + _env(s.ruido(0.14, 6000), 0.015)


def chave_giro():
    n = int(0.3 * s.SR)
    return s.passa_baixa(s.ruido(0.3, s.SR), 900) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 2.5


def chave_impacto():
    dur = 0.45
    return _env(s.seno(130, dur, 38), 0.18) * 1.3 + _env(s.passa_baixa(s.ruido(dur, 5000), 1200), 0.08) * 1.2


def inimigo_dano():
    return _env(s.pulso(420, 0.09, 0.5, f_fim=180), 0.05) + _env(s.ruido(0.09, 8000), 0.02) * 0.5


def inimigo_morte():
    # Explosão estilo Mega Man: ruído grave decaindo + arpejo descendente.
    ruido = _env(s.ruido(0.6, 2500), 0.18)
    arpejo = _seq(*[_env(s.pulso(f, 0.05, 0.5), 0.04) for f in (880, 660, 440, 330, 220)])
    arpejo = np.pad(arpejo, (0, len(ruido) - len(arpejo)))
    return ruido + arpejo * 0.5


def inimigo_alerta():
    return _seq(_env(s.pulso(1000, 0.05, 0.25), 0.04), _env(s.pulso(1500, 0.08, 0.25), 0.05))


def inimigo_golpe():
    n = int(0.2 * s.SR)
    return s.passa_baixa(s.ruido(0.2, s.SR), 1500) * np.sin(np.linspace(0, np.pi, n)) * 2


def lata_arremesso():
    n = int(0.15 * s.SR)
    chocalho = s.ruido(0.15, 600) * (np.sin(np.linspace(0, 40, n)) > 0.6) * 0.4
    return s.passa_baixa(s.ruido(0.15, s.SR), 2000) * np.sin(np.linspace(0, np.pi, n)) + chocalho


def lata_respingo():
    return _env(s.passa_baixa(s.ruido(0.3, 4000), 700), 0.1) * 2 + _env(s.seno(200, 0.3, 80), 0.06)


def jogador_dano():
    return _seq(*[_env(s.pulso(f, 0.05, 0.5), 0.04) for f in (500, 380, 500, 300)])


def jogador_morte():
    descida = _env(s.pulso(880, 1.0, 0.5, f_fim=80), 0.5)
    return descida * 0.7 + _env(s.ruido(1.0, 3000), 0.3) * 0.5


def item():
    return _seq(*[_env(s.pulso(s.freq(m), 0.06, 0.25), 0.08) for m in (72, 76, 79, 84)], _env(s.pulso(s.freq(88), 0.2, 0.25), 0.08))


def checkpoint():
    notas = _seq(*[_env(s.pulso(s.freq(m), 0.08, 0.5), 0.1) for m in (67, 72, 76, 79, 84)])
    brilho = _env(s.seno(2637, len(notas) / s.SR), 0.2) * 0.3
    return notas + brilho


SFX = {nome: fn for nome, fn in globals().items() if callable(fn) and not nome.startswith('_') and nome not in ('np', 's')}


def gerar(nome):
    x = SFX[nome]()
    fade = min(len(x), int(0.005 * s.SR))
    x[-fade:] *= np.linspace(1, 0, fade)  # sem estalo no fim
    m = np.max(np.abs(x)) or 1
    return x / m * 0.9
