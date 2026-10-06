"""Cenários PROVISÓRIOS: tileset, camadas de parallax (com emenda horizontal perfeita) e
decorações. Fase 1 = Floresta de Pinus (verde, céu azul). Fase 2 = Floresta de Eucalipto
(troncos claros descascando, céu de fim de tarde)."""

import math
import random
from PIL import Image
from .base import nova, draw, contorno, escurecer, misturar, gradiente_vertical, CONTORNO

W, H = 384, 240

TEMAS = {
    'fase1': dict(
        ceu_topo=(32, 88, 212, 255), ceu_base=(156, 220, 252, 255), sol=None, nuvem=(252, 252, 252, 255),
        montanha=(88, 120, 176, 255), longe=(40, 96, 120, 255), meio=(24, 88, 64, 255), meio_luz=(40, 120, 72, 255),
        tronco=(112, 64, 40, 255), tronco_luz=(152, 92, 52, 255), tronco_escuro=(68, 36, 24, 255),
        copa=(16, 96, 48, 255), copa_luz=(56, 148, 64, 255), copa_escura=(8, 60, 36, 255),
        grama=(72, 184, 56, 255), grama_luz=(152, 224, 72, 255), grama_escura=(24, 120, 40, 255),
        terra=(132, 84, 44, 255), terra_luz=(168, 112, 60, 255), terra_escura=(88, 52, 28, 255),
        madeira=(176, 116, 60, 255), madeira_luz=(216, 160, 92, 255), casca=(104, 60, 32, 255),
        pedra=(140, 140, 152, 255), pedra_luz=(188, 188, 200, 255), especial=(216, 40, 40, 255),
        arvore='pinus'),
    'fase2': dict(
        ceu_topo=(72, 40, 120, 255), ceu_base=(252, 168, 88, 255), sol=(252, 220, 120, 255), nuvem=(252, 196, 168, 255),
        montanha=(136, 84, 120, 255), longe=(96, 88, 104, 255), meio=(72, 100, 88, 255), meio_luz=(108, 132, 108, 255),
        tronco=(212, 204, 180, 255), tronco_luz=(240, 236, 220, 255), tronco_escuro=(148, 132, 116, 255),
        copa=(72, 128, 104, 255), copa_luz=(120, 168, 132, 255), copa_escura=(44, 88, 76, 255),
        grama=(148, 172, 64, 255), grama_luz=(196, 208, 96, 255), grama_escura=(100, 124, 44, 255),
        terra=(164, 84, 52, 255), terra_luz=(200, 116, 72, 255), terra_escura=(116, 56, 36, 255),
        madeira=(216, 196, 160, 255), madeira_luz=(244, 232, 204, 255), casca=(156, 120, 92, 255),
        pedra=(152, 136, 136, 255), pedra_luz=(196, 184, 180, 255), especial=(196, 120, 72, 255),
        arvore='eucalipto'),
}


# ───────────────────────────── Tileset ─────────────────────────────

def _terra(img, ox, oy, t, rnd):
    d = draw(img)
    d.rectangle([ox, oy, ox + 15, oy + 15], fill=t['terra'])
    for _ in range(7):
        x, y = rnd.randrange(16), rnd.randrange(16)
        d.point((ox + x, oy + y), fill=t['terra_escura'])
    for _ in range(4):
        x, y = rnd.randrange(15), rnd.randrange(15)
        d.rectangle([ox + x, oy + y, ox + x + 1, oy + y], fill=t['terra_luz'])


def _grama_topo(img, ox, oy, t, rnd):
    d = draw(img)
    d.rectangle([ox, oy, ox + 15, oy + 4], fill=t['grama'])
    d.line([(ox, oy), (ox + 15, oy)], fill=t['grama_luz'])
    for x in range(0, 16, 2):  # franja da grama caindo sobre a terra
        h = 5 + (1 if (x // 2 + rnd.randrange(2)) % 2 else 2)
        d.line([(ox + x, oy + 4), (ox + x, oy + h)], fill=t['grama_escura'])
    for x in range(1, 16, 4):
        d.point((ox + x, oy + 1), fill=t['grama_luz'])


def _borda(img, ox, oy, lado, t):
    d = draw(img)
    x = ox if lado == 'esq' else ox + 15
    d.line([(x, oy), (x, oy + 15)], fill=t['terra_escura'])


def _tronco_horizontal(img, ox, oy, t, ponta=None):
    """Ponte de tronco (só a metade de cima do tile é a superfície)."""
    d = draw(img)
    d.rectangle([ox, oy, ox + 15, oy + 9], fill=t['casca'])
    d.line([(ox, oy), (ox + 15, oy)], fill=t['madeira_luz'])
    d.line([(ox, oy + 1), (ox + 15, oy + 1)], fill=t['madeira'])
    for x in range(2, 16, 5):
        d.line([(ox + x, oy + 3), (ox + x + 2, oy + 3)], fill=escurecer(t['casca'], 0.7))
        d.line([(ox + x + 1, oy + 6), (ox + x + 3, oy + 6)], fill=escurecer(t['casca'], 0.7))
    d.line([(ox, oy + 9), (ox + 15, oy + 9)], fill=escurecer(t['casca'], 0.6))
    if ponta:
        x0 = ox if ponta == 'esq' else ox + 10
        d.ellipse([x0, oy, x0 + 5, oy + 9], fill=t['madeira'])
        d.ellipse([x0 + 1, oy + 2, x0 + 4, oy + 7], fill=t['madeira_luz'])
        d.point((x0 + 2, oy + 4), fill=t['casca'])


def tileset(fase):
    t = TEMAS[fase]
    rnd = random.Random(42)
    img = nova(64, 64)
    pos = lambda i: ((i % 4) * 16, (i // 4) * 16)
    d = draw(img)
    # 0–3 grama (esq, meio, dir, isolada) | 4–7 terra (esq, meio, dir, isolada)
    for i, bordas in enumerate([('esq',), (), ('dir',), ('esq', 'dir')]):
        ox, oy = pos(i)
        _terra(img, ox, oy, t, rnd)
        _grama_topo(img, ox, oy, t, rnd)
        for b in bordas:
            _borda(img, ox, oy, b, t)
        ox, oy = pos(4 + i)
        _terra(img, ox, oy, t, rnd)
        for b in bordas:
            _borda(img, ox, oy, b, t)
    # 8 bloco de pular: tábua com moldura (estilo bloco de Mega Man)
    ox, oy = pos(8)
    d.rectangle([ox, oy, ox + 15, oy + 15], fill=t['madeira'])
    d.rectangle([ox, oy, ox + 15, oy + 15], outline=escurecer(t['madeira'], 0.55))
    d.line([(ox + 1, oy + 1), (ox + 14, oy + 1)], fill=t['madeira_luz'])
    d.line([(ox + 1, oy + 1), (ox + 1, oy + 14)], fill=t['madeira_luz'])
    d.line([(ox + 2, oy + 2), (ox + 13, oy + 13)], fill=escurecer(t['madeira'], 0.75))
    d.line([(ox + 13, oy + 2), (ox + 2, oy + 13)], fill=escurecer(t['madeira'], 0.75))
    for cx, cy in ((3, 3), (12, 3), (3, 12), (12, 12)):
        d.point((ox + cx, oy + cy), fill=(60, 60, 70, 255))
    # 9–11 ponte de tronco
    for i, ponta in zip((9, 10, 11), ('esq', None, 'dir')):
        _tronco_horizontal(img, *pos(i), t, ponta)
    # 12 topo do toco (anéis) / 13 corpo do toco
    ox, oy = pos(12)
    d.rectangle([ox + 1, oy + 3, ox + 14, oy + 15], fill=t['casca'])
    d.ellipse([ox + 1, oy, ox + 14, oy + 6], fill=t['madeira'])
    d.ellipse([ox + 4, oy + 1, ox + 11, oy + 5], outline=t['madeira_luz'])
    d.point((ox + 7, oy + 3), fill=t['casca'])
    for x in (3, 7, 11):
        d.line([(ox + x, oy + 7), (ox + x, oy + 15)], fill=escurecer(t['casca'], 0.7))
    ox, oy = pos(13)
    d.rectangle([ox + 1, oy, ox + 14, oy + 15], fill=t['casca'])
    for x in (3, 7, 11):
        d.line([(ox + x, oy), (ox + x, oy + 15)], fill=escurecer(t['casca'], 0.7))
    d.line([(ox + 1, oy), (ox + 1, oy + 15)], fill=escurecer(t['casca'], 0.5))
    # 14 troncos empilhados (pontas cortadas)
    ox, oy = pos(14)
    d.rectangle([ox, oy, ox + 15, oy + 15], fill=escurecer(t['casca'], 0.6))
    for cx, cy in ((4, 4), (11, 4), (4, 11), (11, 11)):
        d.ellipse([ox + cx - 4, oy + cy - 4, ox + cx + 3, oy + cy + 3], fill=t['madeira'], outline=t['casca'])
        d.point((ox + cx, oy + cy), fill=t['casca'])
    # 15 terra com raízes
    ox, oy = pos(15)
    _terra(img, ox, oy, t, rnd)
    d.line([(ox + 2, oy + 3), (ox + 7, oy + 8), (ox + 13, oy + 9)], fill=t['casca'])
    d.line([(ox + 7, oy + 8), (ox + 6, oy + 14)], fill=t['casca'])
    return img


# ───────────────────────────── Parallax ─────────────────────────────

def _repetir(fn, x, *args):
    """Desenha em x e x±W para a camada emendar sem costura."""
    for dx in (-W, 0, W):
        fn(x + dx, *args)


def _pinheiro(d, x, base, altura, cor, cor_luz=None):
    largura = altura * 0.42
    camadas = 4
    for i in range(camadas):
        topo = base - altura + i * altura * 0.2
        fundo = topo + altura * 0.38
        lw = largura * (0.45 + i * 0.2)
        d.polygon([(x, topo), (x - lw, fundo), (x + lw, fundo)], fill=cor)
        if cor_luz:
            d.line([(x, topo + 1), (x + lw * 0.8, fundo - 1)], fill=cor_luz)
    d.rectangle([x - max(1, altura // 30), base - altura * 0.25, x + max(1, altura // 30), base], fill=escurecer(cor, 0.7))


def _eucalipto(d, x, base, altura, tronco, copa, rnd, copa_luz=None):
    larg = max(1, altura // 28)
    d.rectangle([x - larg, base - altura, x + larg, base], fill=tronco)
    for k in range(5):  # copa alta e esparsa, em tufos
        cx = x + rnd.randint(-altura // 8, altura // 8)
        cy = base - altura + rnd.randint(-altura // 12, altura // 5)
        r = rnd.randint(altura // 12, altura // 7) + 2
        d.ellipse([cx - r, cy - r * 0.7, cx + r, cy + r * 0.7], fill=copa)
        if copa_luz:
            d.ellipse([cx - r * 0.6, cy - r * 0.6, cx + r * 0.2, cy - r * 0.1], fill=copa_luz)


def parallax(fase, camada):
    t = TEMAS[fase]
    rnd = random.Random(f'{fase}-{camada}')
    if camada == 0:  # céu
        img = gradiente_vertical(W, H, t['ceu_topo'], t['ceu_base'], faixas=12)
        d = draw(img)
        if t['sol']:
            d.ellipse([280, 120, 336, 176], fill=t['sol'])
            d.ellipse([288, 128, 328, 168], fill=misturar(t['sol'], (255, 255, 240, 255), 0.5))
        for i in range(5):
            cx, cy = i * 77 + rnd.randint(0, 30), rnd.randint(16, 90)
            def nuvem(x, y=cy):
                for k in range(4):
                    r = 6 + (k % 2) * 4
                    d.ellipse([x + k * 9 - r, y - r * 0.7, x + k * 9 + r, y + r * 0.7], fill=t['nuvem'])
                d.rectangle([x - 4, y, x + 30, y + 5], fill=t['nuvem'])
            _repetir(nuvem, cx)
        return img

    img = nova(W, H)
    d = draw(img)
    if camada == 1:  # montanhas (soma de senoides com período que divide W → emenda perfeita)
        pts = [(x, 150 - 34 * math.sin(x / W * math.tau * 2) - 18 * math.sin(x / W * math.tau * 5 + 1)) for x in range(0, W + 1)]
        d.polygon(pts + [(W, H), (0, H)], fill=t['montanha'])
        return img
    if camada == 2:  # árvores distantes
        d.rectangle([0, 186, W, H], fill=t['longe'])
        for i in range(26):
            x = i * W / 26 + rnd.randint(-4, 4)
            h = rnd.randint(40, 64)
            if t['arvore'] == 'pinus':
                _repetir(lambda xx: _pinheiro(d, xx, 192, h, t['longe']), x)
            else:
                _repetir(lambda xx: _eucalipto(d, xx, 192, h + 20, t['longe'], t['longe'], random.Random(i)), x)
        return img
    if camada == 3:  # árvores médias
        d.rectangle([0, 200, W, H], fill=t['meio'])
        for i in range(14):
            x = i * W / 14 + rnd.randint(-8, 8)
            h = rnd.randint(70, 100)
            if t['arvore'] == 'pinus':
                _repetir(lambda xx: _pinheiro(d, xx, 206, h, t['meio'], t['meio_luz']), x)
            else:
                _repetir(lambda xx: _eucalipto(d, xx, 206, h + 30, t['meio_luz'], t['meio'], random.Random(i), t['meio_luz']), x)
        return img
    if camada == 4:  # troncos próximos (cortados pelo topo da tela)
        # Escurecidos na direção da névoa da floresta: ficam "atrás" e não competem com o jogador.
        nevoa = t['meio']
        t = dict(t, tronco=misturar(t['tronco'], nevoa, 0.45), tronco_luz=misturar(t['tronco_luz'], nevoa, 0.45),
                 tronco_escuro=misturar(t['tronco_escuro'], nevoa, 0.45))
        for i in range(4):
            x = i * W / 4 + rnd.randint(-16, 16)
            larg = rnd.randint(6, 9)
            def tronco(xx):
                d.rectangle([xx - larg, 0, xx + larg, 214], fill=t['tronco'])
                d.rectangle([xx - larg, 0, xx - larg + 2, 214], fill=t['tronco_escuro'])
                d.rectangle([xx + larg - 3, 0, xx + larg - 2, 214], fill=t['tronco_luz'])
                for y in range(6, 210, 14):
                    if t['arvore'] == 'pinus':  # casca rachada do pinus
                        d.line([(xx - larg + 4, y), (xx - larg + 6, y + 6)], fill=t['tronco_escuro'])
                        d.line([(xx + 1, y + 7), (xx + 3, y + 12)], fill=t['tronco_escuro'])
                    else:  # placas de casca soltando do eucalipto
                        d.rectangle([xx - larg + 3, y, xx - 1, y + 5], fill=t['tronco_escuro'])
                d.ellipse([xx - larg - 6, 0 - 30, xx + larg + 6, 22], fill=t['copa_escura'])
            _repetir(tronco, x)
        return img
    # camada 5: primeiro plano — tufos de mato na base, o resto transparente
    for i in range(40):
        x = rnd.randint(0, W)
        h = rnd.randint(8, 22)
        cor = t['copa_escura'] if i % 2 else escurecer(t['copa_escura'], 0.75)
        def tufo(xx):
            for k in range(-3, 4):
                d.line([(xx, H), (xx + k * 3, H - h + abs(k) * 2)], fill=cor, width=2)
        _repetir(tufo, x)
    return img


# ───────────────────────────── Decorações ─────────────────────────────

def decoracao(fase, nome, w, h):
    t = TEMAS[fase]
    img = nova(w, h)
    d = draw(img)
    rnd = random.Random(nome)
    if nome == 'arvore':
        cx = w // 2
        if t['arvore'] == 'pinus':
            d.rectangle([cx - 4, 40, cx + 4, h - 1], fill=t['tronco'])
            d.rectangle([cx - 4, 40, cx - 3, h - 1], fill=t['tronco_escuro'])
            for y in range(50, h - 4, 12):
                d.line([(cx - 2, y), (cx, y + 5)], fill=t['tronco_escuro'])
            for i in range(5):
                topo = i * 16
                lw = 8 + i * 4
                d.polygon([(cx, topo), (cx - lw, topo + 28), (cx + lw, topo + 28)], fill=t['copa'])
                d.line([(cx, topo + 1), (cx + lw - 2, topo + 27)], fill=t['copa_luz'])
        else:
            d.rectangle([cx - 4, 30, cx + 4, h - 1], fill=t['tronco'])
            d.rectangle([cx + 2, 30, cx + 3, h - 1], fill=t['tronco_luz'])
            for y in range(40, h - 6, 16):
                d.rectangle([cx - 4, y, cx - 1, y + 6], fill=t['tronco_escuro'])
            for k in range(6):
                x0 = cx + rnd.randint(-16, 10)
                y0 = rnd.randint(0, 36)
                d.ellipse([x0, y0, x0 + 14, y0 + 9], fill=t['copa'])
                d.ellipse([x0 + 2, y0 + 1, x0 + 8, y0 + 4], fill=t['copa_luz'])
    elif nome == 'arbusto':
        for k in range(4):
            x0 = k * 7
            d.ellipse([x0, 2 + (k % 2) * 2, x0 + 12, h + 4], fill=t['copa'])
        d.ellipse([6, 3, 14, 8], fill=t['copa_luz'])
        d.ellipse([18, 5, 25, 9], fill=t['copa_luz'])
    elif nome == 'samambaia':
        for k in range(-3, 4):
            ang = math.radians(-90 + k * 22)
            x1, y1 = w / 2 + math.cos(ang) * 16, h - 1 + math.sin(ang) * 20
            d.line([(w / 2, h - 1), (x1, y1)], fill=t['grama_escura'] if k % 2 else t['grama'], width=2)
            for s in range(3, 15, 3):
                px, py = w / 2 + math.cos(ang) * s, h - 1 + math.sin(ang) * s * 1.2
                d.point((px + 1, py), fill=t['grama_luz'])
    elif nome == 'pedra':
        d.ellipse([0, 2, w - 1, h + 6], fill=t['pedra'])
        d.ellipse([4, 4, 12, 8], fill=t['pedra_luz'])
    elif nome == 'cogumelo':
        if t['arvore'] == 'pinus':
            for x0, s in ((2, 5), (9, 4)):
                d.rectangle([x0 + s // 2 - 1, h - 6, x0 + s // 2, h - 1], fill=(240, 232, 208, 255))
                d.chord([x0 - 1, h - 6 - s, x0 + s + 1, h - 4], 180, 360, fill=t['especial'])
                d.point((x0 + 1, h - 8), fill=(252, 252, 252, 255))
        else:  # casca de eucalipto caída
            d.polygon([(0, h - 1), (6, h - 6), (15, h - 4), (12, h - 1)], fill=t['tronco_escuro'])
            d.line([(2, h - 2), (12, h - 4)], fill=t['tronco_luz'])
    elif nome == 'placa':
        d.rectangle([14, 14, 17, h - 1], fill=t['casca'])
        d.polygon([(2, 4), (24, 4), (30, 11), (24, 18), (2, 18)], fill=t['madeira'])
        d.line([(4, 6), (22, 6)], fill=t['madeira_luz'])
        d.polygon([(8, 9), (16, 9), (16, 7), (21, 11), (16, 15), (16, 13), (8, 13)], fill=(252, 252, 252, 255))
    return contorno(img, CONTORNO) if nome not in ('arvore',) else contorno(img, escurecer(t['copa_escura'], 0.6))
