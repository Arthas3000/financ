"""Arte FINAL da interface (menus, seleção, logo) — estilo fliperama metálico tipo Metal Slug:
placas de metal rebitadas, faixas de alerta amarelo/preto, títulos com gradiente dourado."""

import math
from PIL import Image
from .base import (nova, draw, contorno, tira, escurecer, misturar, gradiente_vertical, pixels, CONTORNO, PRETO,
                   BRANCO, AMARELO, AMARELO_ESCURO, LARANJA, LARANJA_ESCURO, VERMELHO, VERMELHO_ESCURO, METAL,
                   METAL_SOMBRA, METAL_BRILHO, CINZA, CINZA_ESCURO, CINZA_CLARO, PELE, PELE_SOMBRA,
                   CABELO_PRETO, CABELO_CASTANHO, CABELO_RUIVO, AZUL, AZUL_ESCURO, AZUL_CLARO, VERDE,
                   VERDE_ESCURO, MARROM, MARROM_ESCURO, TRANSP)
from .fonte import _glifo, CORES

AZUL_NOITE = (16, 24, 56, 255)
AZUL_PLACA = (36, 52, 104, 255)
AZUL_PLACA_LUZ = (64, 88, 156, 255)


# ───────────────────────────── Peças reutilizáveis ─────────────────────────────

def _placa(d, x0, y0, x1, y1, fundo, borda=METAL, borda_sombra=METAL_SOMBRA, rebites=True):
    """Placa de metal com bisel e rebites nos cantos."""
    d.rectangle([x0, y0, x1, y1], fill=CONTORNO)
    d.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=borda_sombra)
    d.line([(x0 + 1, y0 + 1), (x1 - 1, y0 + 1)], fill=borda)
    d.line([(x0 + 1, y0 + 1), (x0 + 1, y1 - 1)], fill=borda)
    d.rectangle([x0 + 2, y0 + 2, x1 - 2, y1 - 2], fill=fundo)
    if rebites:
        for rx, ry in ((x0 + 3, y0 + 3), (x1 - 3, y0 + 3), (x0 + 3, y1 - 3), (x1 - 3, y1 - 3)):
            d.point((rx, ry), fill=METAL_BRILHO)


def _faixa_alerta(d, x0, y0, x1, y1, deslocamento=0):
    """Listras diagonais amarelo/preto."""
    d.rectangle([x0, y0, x1, y1], fill=PRETO)
    h = y1 - y0 + 1
    for x in range(x0 - h + deslocamento % 8, x1 + h, 8):
        d.polygon([(x, y1), (x + 4, y1), (x + 4 + h, y0), (x + h, y0)], fill=AMARELO)
    d.rectangle([x1 + 1, y0, x1 + h + 8, y1], fill=TRANSP)


def texto_grande(texto, escala, tons=None, espaco=1):
    """Renderiza texto com a fonte 5x7 ampliada, com gradiente vertical por linha de pixel."""
    tons = tons or CORES['metal']
    glifos = [_glifo(c) if c != ' ' else None for c in texto]
    largura = sum((len(g[2]) + espaco) * escala if g else 3 * escala for g in glifos)
    img = nova(largura, 10 * escala)
    d = draw(img)
    x = 0
    for g in glifos:
        if not g:
            x += 3 * escala
            continue
        for y, linha in enumerate(g):
            for i, v in enumerate(linha):
                if v != '#':
                    continue
                for sy in range(escala):
                    yy = y * escala + sy
                    # gradiente contínuo ao longo da altura da letra (linhas 2..8)
                    t = max(0, min(len(tons) - 1, int((yy - 2 * escala) / (7 * escala) * len(tons))))
                    cor = tons[t] + (255,)
                    if sy == 0 and y >= 2 and (y == 2 or g[y - 1][i] != '#'):
                        cor = (255, 255, 240, 255)  # brilho na borda de cima
                    d.line([(x + i * escala, yy), (x + i * escala + escala - 1, yy)], fill=cor)
        x += (len(g[2]) + espaco) * escala
    return img


def _contorno_grosso(img, px=2, cor=CONTORNO):
    for _ in range(px):
        img = contorno(img, cor, diagonal=True)
    return img


# ───────────────────────────── Logo ─────────────────────────────

def logo(w=320, h=112):
    img = nova(w, h)
    d = draw(img)
    # Sabre de motosserra atravessado atrás do título.
    ang = math.radians(-14)
    ux, uy = math.cos(ang), math.sin(ang)
    nx, ny = -uy, ux
    x0, y0 = 26, 82
    comp, larg = 270, 14
    pts = [(x0 + nx * larg / 2, y0 + ny * larg / 2), (x0 + ux * comp + nx * larg / 2, y0 + uy * comp + ny * larg / 2),
           (x0 + ux * comp - nx * larg / 2, y0 + uy * comp - ny * larg / 2), (x0 - nx * larg / 2, y0 - ny * larg / 2)]
    d.polygon(pts, fill=METAL)
    ex, ey = x0 + ux * comp, y0 + uy * comp
    d.ellipse([ex - 7, ey - 7, ex + 7, ey + 7], fill=METAL)
    d.line([(x0 + nx * 2, y0 + ny * 2), (ex + nx * 2, ey + ny * 2)], fill=METAL_SOMBRA, width=2)
    for k in range(0, comp, 5):  # dentes da corrente nas duas bordas
        for s in (-1, 1):
            px, py = x0 + ux * k + nx * s * (larg / 2 + 1), y0 + uy * k + ny * s * (larg / 2 + 1)
            d.rectangle([px - 1, py - 1, px + 1, py + 1], fill=CINZA_ESCURO)
    d.rectangle([x0 - 22, y0 - 6, x0 - 2, y0 + 6], fill=LARANJA)  # cabo
    d.rectangle([x0 - 22, y0 - 6, x0 - 2, y0 - 4], fill=AMARELO)
    img = contorno(img)

    # Título em duas linhas com contorno grosso e sombra.
    linha1 = _contorno_grosso(texto_grande('FÚRIA NA', 4), 2)
    linha2 = _contorno_grosso(texto_grande('FLORESTA', 5), 2)
    for t, y in ((linha1, 0), (linha2, 34)):
        x = (w - t.width) // 2
        sombra = Image.new('RGBA', t.size, (0, 0, 0, 0))
        sombra.paste((24, 8, 8, 200), (0, 0), t)
        img.alpha_composite(sombra, (x + 3, y + 3))
        img.alpha_composite(t, (x, y))

    # Faixa com subtítulo.
    fx0, fy0, fx1, fy1 = 52, 92, w - 52, 108
    d = draw(img)
    d.polygon([(fx0 - 8, fy0), (fx1 + 8, fy0), (fx1, fy1), (fx0, fy1)], fill=CONTORNO)
    d.polygon([(fx0 - 6, fy0 + 1), (fx1 + 6, fy0 + 1), (fx1 - 1, fy1 - 1), (fx0 + 1, fy1 - 1)], fill=VERMELHO)
    d.line([(fx0 - 5, fy0 + 2), (fx1 + 5, fy0 + 2)], fill=misturar(VERMELHO, BRANCO, 0.4))
    sub = contorno(texto_grande('SABRE · CHAVE · PARAFUSO', 1, tons=[(252, 252, 252)]), CONTORNO, diagonal=True)
    img.alpha_composite(sub, ((w - sub.width) // 2, fy0 + 2))
    return img


# ───────────────────────────── Elementos de menu ─────────────────────────────

def vinheta(w=384, h=216):
    img = nova(w, h)
    p = img.load()
    for y in range(h):
        for x in range(w):
            dx, dy = (x - w / 2) / (w / 2), (y - h / 2) / (h / 2)
            dist = math.sqrt(dx * dx * 0.8 + dy * dy)
            a = int(max(0, min(1, (dist - 0.55) / 0.6)) * 4) * 45  # em degraus
            # faixa escura atrás da área dos botões, para legibilidade
            if 128 <= y <= 196:
                a = max(a, 70)
            p[x, y] = (6, 8, 20, a)
    return img


def botao(selecionado=False, quadro=0, w=128, h=20):
    img = nova(w, h)
    d = draw(img)
    if selecionado:
        _placa(d, 0, 0, w - 1, h - 1, VERMELHO_ESCURO, borda=AMARELO, borda_sombra=LARANJA_ESCURO)
        d.rectangle([2, 2, w - 3, 8], fill=VERMELHO)
        # Brilho diagonal correndo pelo botão, recortado ao miolo da placa.
        brilho = nova(w, h)
        x = -20 + quadro * (w + 30) // 6
        draw(brilho).polygon([(x, h - 3), (x + 6, h - 3), (x + 14, 2), (x + 8, 2)], fill=misturar(VERMELHO, BRANCO, 0.5))
        miolo = brilho.crop((2, 2, w - 2, h - 2))
        img.alpha_composite(miolo, (2, 2))
    else:
        _placa(d, 0, 0, w - 1, h - 1, AZUL_PLACA)
        d.rectangle([2, 2, w - 3, 8], fill=AZUL_PLACA_LUZ)
    return img


def cursor():
    quadros = []
    seta = ['##......', '###.....', '####....', '#####...', '######..', '#######.',
            '######..', '#####...', '####....', '###.....', '##......']
    for dx in (0, 1, 2, 1):
        img = nova(16, 16)
        pixels(img, 3 + dx, 2, seta, {'#': AMARELO})
        pixels(img, 3 + dx, 2, ['#', '#', '#', '#', '#'], {'#': (255, 252, 200, 255)})
        quadros.append(contorno(img, CONTORNO, diagonal=True))
    return tira(quadros)


def painel():
    img = nova(24, 24)
    _placa(draw(img), 0, 0, 23, 23, (20, 28, 64, 240))
    d = draw(img)
    d.line([(2, 2), (21, 2)], fill=AZUL_PLACA_LUZ)
    return img


def faixa(w=384, h=40):
    img = nova(w, h)
    d = draw(img)
    d.rectangle([0, 5, w - 1, h - 6], fill=(14, 14, 30, 230))
    _faixa_alerta(d, 0, 0, w - 1, 3)
    _faixa_alerta(d, 0, h - 4, w - 1, h - 1, 4)
    d.line([(0, 4), (w, 4)], fill=CONTORNO)
    d.line([(0, h - 5), (w, h - 5)], fill=CONTORNO)
    return img


def selecao_fundo(w=384, h=216):
    img = gradiente_vertical(w, h, (8, 12, 40, 255), (40, 20, 72, 255), faixas=10)
    d = draw(img)
    for x in range(-h, w, 24):  # listras diagonais sutis
        d.polygon([(x, h), (x + 10, h), (x + 10 + h, 0), (x + h, 0)], fill=(255, 255, 255, 10))
    img2 = nova(w, h)
    d2 = draw(img2)
    for x in range(-h, w, 24):
        d2.polygon([(x, h), (x + 10, h), (x + 10 + h, 0), (x + h, 0)], fill=(120, 140, 255, 22))
    img.alpha_composite(img2)
    d = draw(img)
    for y in range(0, h, 8):  # scanlines de fliperama
        d.line([(0, y), (w, y)], fill=(0, 0, 0, 40))
    d.rectangle([0, h - 30, w, h], fill=(8, 8, 20, 255))
    _faixa_alerta(d, 0, h - 32, w - 1, h - 30)
    return img


def card(selecionado=False, quadro=0, w=116, h=152):
    img = nova(w, h)
    d = draw(img)
    if selecionado:
        borda = AMARELO if quadro == 0 else BRANCO
        _placa(d, 0, 0, w - 1, h - 1, (28, 36, 84, 255), borda=borda, borda_sombra=LARANJA)
        d.rectangle([2, 2, w - 3, h - 3], outline=borda)
    else:
        _placa(d, 0, 0, w - 1, h - 1, (20, 24, 52, 255))
    # moldura do retrato
    d.rectangle([w // 2 - 34, 4, w // 2 + 33, 71], fill=CONTORNO)
    d.rectangle([w // 2 - 33, 5, w // 2 + 32, 70], fill=(10, 12, 28, 255))
    d.line([(6, 83), (w - 7, 83)], fill=METAL_SOMBRA)
    d.line([(6, 113), (w - 7, 113)], fill=METAL_SOMBRA)
    return img


# ───────────────────────────── Retratos (32x32 ampliado 2x) ─────────────────────────────

RETRATOS = {
    'samurai_jeff': dict(fundo=(120, 20, 28), roupa=VERMELHO, roupa2=BRANCO, cabelo=CABELO_PRETO, estilo='coque', barba='cheia'),
    'kanka': dict(fundo=(16, 56, 140), roupa=AZUL, roupa2=AZUL_CLARO, cabelo=CABELO_CASTANHO, estilo='curto', barba='curta'),
    'paulinho': dict(fundo=(20, 96, 40), roupa=VERDE, roupa2=VERDE_ESCURO, cabelo=CABELO_RUIVO, estilo='topete', barba='grande'),
}


def retrato(personagem):
    c = RETRATOS[personagem]
    img = nova(32, 32)
    d = draw(img)
    fundo = c['fundo'] + (255,)
    for y in range(32):  # fundo com listras de "seleção"
        d.line([(0, y), (31, y)], fill=fundo if (y // 2) % 2 else escurecer(fundo, 0.8))
    corpo = nova(32, 32)
    b = draw(corpo)
    larg_ombro = 3 if personagem != 'paulinho' else 1
    b.rectangle([larg_ombro, 24, 31 - larg_ombro, 31], fill=c['roupa'])
    b.ellipse([larg_ombro, 22, 31 - larg_ombro, 34], fill=c['roupa'])
    if personagem == 'samurai_jeff':
        b.polygon([(12, 23), (16, 31), (20, 23)], fill=c['roupa2'])
    elif personagem == 'kanka':
        b.rectangle([9, 27, 22, 31], fill=c['roupa2'])
        b.rectangle([10, 24, 12, 31], fill=AZUL_ESCURO)
        b.rectangle([19, 24, 21, 31], fill=AZUL_ESCURO)
    b.rectangle([13, 19, 18, 24], fill=PELE_SOMBRA)  # pescoço
    b.rectangle([9, 6, 22, 21], fill=PELE)          # cabeça
    b.rectangle([8, 11, 9, 15], fill=PELE_SOMBRA)   # orelhas
    b.rectangle([22, 11, 23, 15], fill=PELE_SOMBRA)
    cab = c['cabelo']
    b.rectangle([9, 4, 22, 8], fill=cab)
    b.rectangle([8, 6, 9, 11], fill=cab)
    b.rectangle([22, 6, 23, 11], fill=cab)
    if c['estilo'] == 'coque':
        b.ellipse([12, 0, 19, 5], fill=cab)
        b.rectangle([13, 4, 18, 4], fill=VERMELHO)
    elif c['estilo'] == 'topete':
        b.polygon([(11, 5), (21, -1), (20, 7)], fill=cab)
        b.rectangle([9, 4, 22, 6], fill=cab)
    elif c['estilo'] == 'curto':
        b.rectangle([10, 3, 21, 5], fill=cab)
        b.point((13, 8), fill=cab)
    # sobrancelhas (cara de brabo) e olhos
    b.line([(11, 10), (14, 11)], fill=cab)
    b.line([(17, 11), (20, 10)], fill=cab)
    b.rectangle([12, 12, 13, 13], fill=BRANCO)
    b.rectangle([18, 12, 19, 13], fill=BRANCO)
    b.point((13, 13), fill=PRETO)
    b.point((18, 13), fill=PRETO)
    b.rectangle([15, 13, 16, 16], fill=PELE_SOMBRA)  # nariz
    if c['barba'] == 'cheia':
        b.rectangle([9, 16, 22, 22], fill=cab)
        b.rectangle([10, 23, 21, 23], fill=cab)
        b.rectangle([11, 16, 20, 17], fill=cab)
        b.rectangle([14, 19, 17, 19], fill=VERMELHO_ESCURO)
    elif c['barba'] == 'curta':
        b.rectangle([10, 18, 21, 21], fill=cab)
        b.rectangle([12, 16, 19, 16], fill=cab)
        b.rectangle([14, 18, 17, 18], fill=VERMELHO_ESCURO)
    elif c['barba'] == 'grande':
        b.ellipse([7, 14, 24, 27], fill=cab)
        b.rectangle([11, 16, 20, 17], fill=cab)
        b.rectangle([14, 19, 17, 19], fill=VERMELHO_ESCURO)
        b.point((12, 24), fill=escurecer(cab, 0.7))
        b.point((19, 23), fill=escurecer(cab, 0.7))
    corpo = contorno(corpo)
    img.alpha_composite(corpo)
    return img.resize((64, 64), Image.NEAREST)


def retrato_hud(personagem):
    """Versão 20x20 (só o rosto) para o HUD."""
    grande = retrato(personagem)
    return grande.crop((12, 2, 52, 42)).resize((20, 20), Image.NEAREST)


# ───────────────────────────── Ícones de arma e barras ─────────────────────────────

def icone(nome):
    img = nova(32, 16)
    d = draw(img)
    if nome == 'sabre_oregon':
        d.rectangle([1, 6, 7, 10], fill=LARANJA)
        d.rectangle([1, 6, 7, 7], fill=AMARELO)
        d.rectangle([8, 5, 27, 11], fill=METAL)
        d.ellipse([24, 5, 30, 11], fill=METAL)
        d.line([(9, 8), (27, 8)], fill=METAL_SOMBRA)
        for x in range(9, 29, 2):
            d.point((x, 4), fill=CINZA_ESCURO)
            d.point((x, 12), fill=CINZA_ESCURO)
    elif nome == 'ferramentas':
        d.rectangle([3, 7, 12, 8], fill=METAL)          # chave
        d.ellipse([0, 5, 5, 10], fill=METAL)
        d.ellipse([10, 5, 15, 10], fill=METAL)
        d.polygon([(21, 3), (25, 5), (25, 10), (21, 12), (17, 10), (17, 5)], fill=METAL)  # porca
        d.ellipse([19, 5, 23, 9], fill=TRANSP)
        d.rectangle([27, 4, 29, 6], fill=METAL_SOMBRA)  # parafuso
        d.rectangle([28, 7, 28, 13], fill=METAL_SOMBRA)
    elif nome == 'chave_engenheiro':
        d.rectangle([1, 6, 20, 9], fill=METAL)
        d.line([(2, 7), (19, 7)], fill=METAL_BRILHO)
        d.ellipse([18, 1, 30, 14], fill=METAL)
        d.rectangle([25, 5, 31, 10], fill=TRANSP)
        d.rectangle([1, 6, 6, 9], fill=VERMELHO)
    return contorno(img)


def status(cheio):
    img = nova(8, 6)
    d = draw(img)
    if cheio:
        d.rectangle([0, 0, 7, 5], fill=(40, 200, 64, 255))
        d.line([(0, 0), (7, 0)], fill=(168, 252, 120, 255))
        d.line([(0, 5), (7, 5)], fill=(16, 112, 40, 255))
    else:
        d.rectangle([0, 0, 7, 5], fill=(36, 40, 64, 255))
        d.line([(0, 0), (7, 0)], fill=(60, 64, 92, 255))
    return img


def carregando_moldura():
    img = nova(128, 10)
    _placa(draw(img), 0, 0, 127, 9, PRETO, rebites=False)
    return img


def carregando_barra():
    img = nova(124, 6)
    d = draw(img)
    for y, cor in enumerate([(255, 248, 180), (252, 216, 0), (252, 216, 0), (248, 152, 0), (232, 96, 0), (200, 56, 0)]):
        d.line([(0, y), (123, y)], fill=cor + (255,))
    return img
