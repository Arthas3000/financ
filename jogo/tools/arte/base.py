"""Paleta e utilitários de pixel art (inspirados no NES/Mega Man: cores chapadas, contorno escuro)."""

from PIL import Image, ImageDraw

# ── Paleta ────────────────────────────────────────────────────────────────
TRANSP = (0, 0, 0, 0)
CONTORNO = (20, 16, 28, 255)
PRETO = (8, 8, 12, 255)
BRANCO = (252, 252, 252, 255)
CINZA_CLARO = (188, 188, 196, 255)
CINZA = (124, 124, 136, 255)
CINZA_ESCURO = (72, 72, 84, 255)
PELE = (252, 188, 148, 255)
PELE_SOMBRA = (212, 132, 96, 255)
CABELO_PRETO = (40, 32, 36, 255)
CABELO_CASTANHO = (104, 60, 32, 255)
CABELO_RUIVO = (152, 76, 28, 255)
VERMELHO = (216, 40, 40, 255)
VERMELHO_ESCURO = (136, 20, 28, 255)
LARANJA = (248, 120, 8, 255)
LARANJA_ESCURO = (184, 72, 0, 255)
AMARELO = (252, 216, 0, 255)
AMARELO_ESCURO = (200, 152, 0, 255)
AZUL = (0, 112, 236, 255)
AZUL_ESCURO = (0, 56, 160, 255)
AZUL_CLARO = (60, 188, 252, 255)
CIANO = (0, 232, 216, 255)
VERDE = (0, 168, 68, 255)
VERDE_ESCURO = (0, 100, 40, 255)
VERDE_CLARO = (128, 208, 16, 255)
MARROM = (136, 80, 32, 255)
MARROM_ESCURO = (84, 48, 20, 255)
MARROM_CLARO = (188, 124, 64, 255)
ROXO = (104, 68, 252, 255)
METAL = (200, 204, 216, 255)
METAL_SOMBRA = (120, 124, 140, 255)
METAL_BRILHO = (248, 248, 255, 255)


def nova(w, h):
    return Image.new('RGBA', (w, h), TRANSP)


def draw(img):
    return ImageDraw.Draw(img)


def contorno(img, cor=CONTORNO, diagonal=False):
    """Adiciona 1 px de contorno ao redor de tudo que não é transparente."""
    w, h = img.size
    src = img.load()
    out = img.copy()
    dst = out.load()
    viz = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    if diagonal:
        viz += [(-1, -1), (1, -1), (-1, 1), (1, 1)]
    for y in range(h):
        for x in range(w):
            if src[x, y][3] != 0:
                continue
            for dx, dy in viz:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] != 0 and src[nx, ny] != cor:
                    dst[x, y] = cor
                    break
    return out


def tira(quadros):
    """Junta quadros (mesmo tamanho) numa tira horizontal."""
    w, h = quadros[0].size
    out = nova(w * len(quadros), h)
    for i, q in enumerate(quadros):
        out.paste(q, (i * w, 0), q)
    return out


def escurecer(cor, f=0.6):
    r, g, b, a = cor
    return (int(r * f), int(g * f), int(b * f), a)


def misturar(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)


def pixels(img, x, y, desenho, cores):
    """Desenha um padrão ASCII: cada caractere é uma chave em `cores` ('.' = vazio)."""
    p = img.load()
    for j, linha in enumerate(desenho):
        for i, ch in enumerate(linha):
            if ch in cores:
                xx, yy = x + i, y + j
                if 0 <= xx < img.width and 0 <= yy < img.height:
                    p[xx, yy] = cores[ch]


def gradiente_vertical(w, h, topo, base, faixas=None):
    """Gradiente em degraus (pixel art não usa degradê suave)."""
    img = nova(w, h)
    d = draw(img)
    faixas = faixas or h
    for y in range(h):
        t = int(y / h * faixas) / max(1, faixas - 1)
        d.line([(0, y), (w, y)], fill=misturar(topo, base, min(1, t)))
    return img
