"""Sprites PROVISÓRIOS diversos: projéteis, efeitos, itens e HUD."""

import math
import random
from .base import (nova, draw, contorno, tira, escurecer, misturar, CONTORNO, BRANCO, AMARELO, LARANJA,
                   VERMELHO, VERMELHO_ESCURO, CINZA, CINZA_CLARO, CINZA_ESCURO, METAL, METAL_SOMBRA, METAL_BRILHO,
                   MARROM, MARROM_CLARO, MARROM_ESCURO, AZUL_CLARO, AZUL, VERDE, PRETO, PELE, CIANO)

POEIRA = (220, 200, 160, 255)


# ── Projéteis (16x16, apontando para a direita; o jogo gira) ──
def projetil(nome):
    img = nova(16, 16)
    d = draw(img)
    if nome == 'chave_de_boca':
        d.rectangle([4, 7, 11, 8], fill=METAL)
        for cx, boca in ((3, 1), (12, 14)):  # cabeças abertas nas duas pontas
            d.ellipse([cx - 3, 5, cx + 3, 10], fill=METAL)
            d.rectangle([boca - 1, 7, boca + 1, 8], fill=(0, 0, 0, 0))
        d.line([(5, 7), (10, 7)], fill=METAL_BRILHO)
    elif nome == 'parafuso':
        d.rectangle([3, 5, 5, 10], fill=METAL)
        d.rectangle([6, 7, 13, 8], fill=METAL_SOMBRA)
        for x in range(7, 14, 2):
            d.point((x, 6), fill=METAL)
            d.point((x, 9), fill=METAL)
    elif nome == 'porca':
        d.polygon([(8, 3), (12, 5), (12, 10), (8, 12), (4, 10), (4, 5)], fill=METAL)
        d.ellipse([6, 5, 10, 9], fill=(0, 0, 0, 0))
        d.line([(8, 4), (11, 6)], fill=METAL_BRILHO)
    elif nome == 'arruela':
        d.ellipse([3, 3, 12, 12], fill=METAL_SOMBRA)
        d.ellipse([6, 6, 9, 9], fill=(0, 0, 0, 0))
        d.arc([3, 3, 12, 12], 200, 290, fill=METAL_BRILHO)
    elif nome == 'lata_oleo':
        d.rectangle([4, 3, 11, 13], fill=VERMELHO)
        d.rectangle([4, 6, 11, 9], fill=AMARELO)
        d.rectangle([7, 1, 8, 2], fill=CINZA)
        d.line([(5, 4), (5, 12)], fill=misturar(VERMELHO, BRANCO, 0.4))
    return contorno(img)


# ── Efeitos ──
def efeito(nome, fw, fh, n):
    rnd = random.Random(nome)
    quadros = []
    for i in range(n):
        p = i / max(1, n - 1)
        img = nova(fw, fh)
        d = draw(img)
        if nome in ('poeira_pulo', 'poeira_aterrissagem'):
            espalha = 4 + p * (12 if nome == 'poeira_aterrissagem' else 8)
            r = 3 * (1 - p) + 1
            for s in (-1, 1):
                cx = fw / 2 + s * espalha
                cy = fh - 3 - (p * 4 if nome == 'poeira_pulo' else p * 2)
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=POEIRA)
            if nome == 'poeira_pulo':
                d.ellipse([fw / 2 - r, fh - 4 - p * 6 - r, fw / 2 + r, fh - 4 - p * 6 + r], fill=POEIRA)
        elif nome == 'faisca_acerto':
            c = fw / 2
            raio = 4 + p * 11
            cor = [BRANCO, AMARELO, LARANJA, VERMELHO][min(3, i)]
            for k in range(8):
                a = k * math.pi / 4 + (0.3 if i % 2 else 0)
                comp = raio if k % 2 == 0 else raio * 0.6
                d.line([(c + math.cos(a) * raio * 0.3, c + math.sin(a) * raio * 0.3),
                        (c + math.cos(a) * comp, c + math.sin(a) * comp)], fill=cor, width=2 if i < 2 else 1)
            if i == 0:
                d.ellipse([c - 4, c - 4, c + 4, c + 4], fill=BRANCO)
        elif nome == 'faisca_metal':
            c = fw / 2
            for k in range(5):
                a = -math.pi * (0.1 + 0.2 * k)
                l = 2 + i * 2.5
                d.line([(c, fh - 2), (c + math.cos(a) * l, fh - 2 + math.sin(a) * l)], fill=AMARELO if i < 2 else LARANJA)
        elif nome == 'serragem':
            cores = [MARROM_CLARO, (232, 196, 140, 255)]
            pts = [(1, 3), (3, 1), (6, 3), (3, 6)]
            x, y = pts[i % 4]
            d.rectangle([x, y, x + 2, y + 1] if i % 2 else [x, y, x + 1, y + 2], fill=cores[i % 2])
        elif nome == 'onda_impacto':
            larg = 8 + p * 26
            alt = 12 * (1 - p) + 2
            for s in (-1, 1):
                d.polygon([(fw / 2, fh - 1), (fw / 2 + s * larg, fh - 1), (fw / 2 + s * larg * 0.7, fh - 1 - alt)], fill=POEIRA)
            for k in range(4):
                x = fw / 2 + (k - 1.5) * larg * 0.6
                d.rectangle([x, fh - alt - 4 - k % 2 * 3, x + 2, fh - alt - 2 - k % 2 * 3], fill=MARROM_CLARO)
        elif nome == 'explosao_orbe':
            r = [6, 5, 4, 5][i % 4]
            c = fw / 2
            d.ellipse([c - r, c - r, c + r - 1, c + r - 1], fill=AZUL_CLARO if i % 2 else CIANO)
            d.ellipse([c - r + 2, c - r + 2, c, c], fill=BRANCO)
        elif nome == 'fumaca':
            for k in range(5):
                a = k * math.tau / 5 + i * 0.4
                dist = 4 + p * 14
                r = 9 * (1 - p * 0.7)
                cx, cy = fw / 2 + math.cos(a) * dist, fh * 0.6 + math.sin(a) * dist * 0.6 - p * 10
                cor = misturar((236, 236, 236, 255), (140, 140, 150, 255), p)
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor)
        elif nome == 'respingo_oleo':
            for k in range(6):
                a = -math.pi * (0.1 + k * 0.16)
                dist = 3 + p * 12
                x, y = fw / 2 + math.cos(a) * dist, fh - 2 + math.sin(a) * dist * 0.8 + p * p * 8
                d.ellipse([x - 2, y - 2, x + 1, y + 1], fill=(40, 32, 40, 255))
            d.ellipse([fw / 2 - 4 - p * 6, fh - 3, fw / 2 + 4 + p * 6, fh - 1], fill=(48, 36, 52, 255))
        elif nome == 'brilho_item':
            c = fw / 2
            l = 2 + (i if i < 2 else 3 - i) * 3 + 1
            d.line([(c - l, c), (c + l, c)], fill=BRANCO)
            d.line([(c, c - l), (c, c + l)], fill=BRANCO)
            d.point((c, c), fill=AMARELO)
        elif nome == 'alerta':
            y0 = 1 if i == 0 else 2
            d.rectangle([6, y0, 9, y0 + 8], fill=AMARELO)
            d.rectangle([6, y0 + 10, 9, y0 + 12], fill=AMARELO)
        if nome not in ('serragem', 'brilho_item'):
            img = contorno(img) if nome in ('alerta', 'explosao_orbe', 'faisca_metal') else img
        quadros.append(img)
    return tira(quadros)


# ── Itens ──
def item(nome, fw, fh, n):
    quadros = []
    for i in range(n):
        img = nova(fw, fh)
        d = draw(img)
        if nome == 'marmita':
            d.rectangle([2, 6, 13, 14], fill=METAL)
            d.rectangle([1, 4, 14, 6], fill=CINZA_CLARO)
            d.rectangle([6, 2, 9, 3], fill=CINZA)
            d.line([(3, 8), (12, 8)], fill=METAL_SOMBRA)
            if i % 2:
                d.point((4, 9), fill=METAL_BRILHO)
                d.point((5, 10), fill=METAL_BRILHO)
            # "vapor" saindo
            d.point((5 + i, 1 - (i % 2)), fill=BRANCO)
            img = contorno(img)
        elif nome in ('checkpoint_inativo', 'checkpoint_ativo'):
            ativo = nome == 'checkpoint_ativo'
            d.rectangle([14, 12, 17, fh - 1], fill=MARROM)
            cor = VERDE if ativo else CINZA
            onda = [0, 1, 2, 1][i % 4] if ativo else 0
            d.polygon([(17, 12), (30, 15 + onda), (17, 22)], fill=cor)
            d.rectangle([10, fh - 4, 21, fh - 1], fill=CINZA_ESCURO)
            d.ellipse([12, 8, 19, 13], fill=AMARELO if ativo else CINZA_CLARO)
            img = contorno(img)
        elif nome == 'fim_de_fase':
            d.rectangle([3, 4, 5, fh - 1], fill=CINZA_CLARO)
            onda = [0, 1, 2, 1][i % 4]
            for k in range(6):
                for j in range(3):
                    cor = BRANCO if (k + j) % 2 else PRETO
                    d.rectangle([6 + k * 4, 6 + j * 4 + (onda if k > 2 else 0), 9 + k * 4, 9 + j * 4 + (onda if k > 2 else 0)], fill=cor)
            d.ellipse([2, 1, 6, 5], fill=AMARELO)
            d.rectangle([0, fh - 4, 9, fh - 1], fill=CINZA_ESCURO)
            img = contorno(img)
        quadros.append(img)
    return tira(quadros)


# ── HUD ──
def hud(nome, w, h):
    img = nova(w, h)
    d = draw(img)
    if nome == 'moldura_retrato':
        d.rectangle([0, 0, w - 1, h - 1], fill=CONTORNO)
        d.rectangle([1, 1, w - 2, h - 2], outline=METAL)
        d.rectangle([2, 2, w - 3, h - 3], fill=(24, 40, 96, 255))
    elif nome == 'barra_vida':
        d.rectangle([0, 0, w - 1, h - 1], fill=CONTORNO)
        d.rectangle([1, 1, w - 2, h - 2], outline=METAL)
        d.rectangle([2, 2, w - 3, h - 3], fill=PRETO)
    elif nome == 'vida_cheia':
        d.rectangle([0, 0, w - 1, h - 1], fill=(252, 228, 160, 255))
        d.point((0, 0), fill=BRANCO)
    elif nome == 'vida_vazia':
        d.rectangle([0, 0, w - 1, h - 1], fill=(48, 48, 64, 255))
    return img
