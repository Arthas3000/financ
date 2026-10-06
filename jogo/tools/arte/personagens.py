"""Sprites PROVISÓRIOS de personagens e inimigos (64x64, olhando para a direita, pés na última linha).

Cada quadro é montado como um "boneco articulado": pernas, tronco, cabeça (cabelo/barba de cada
personagem), braços em um ângulo e a arma presa na mão. As poses foram pensadas para coincidir
com as hitboxes de src/config/characters.js — use-as como referência de proporção e timing
ao desenhar a arte definitiva.
"""

import math
from PIL import Image
from .base import (nova, draw, contorno, tira, escurecer, PELE, PELE_SOMBRA, CABELO_PRETO, CABELO_CASTANHO,
                   CABELO_RUIVO, VERMELHO, VERMELHO_ESCURO, BRANCO, CINZA_ESCURO, CINZA, CINZA_CLARO, PRETO,
                   AZUL, AZUL_ESCURO, AZUL_CLARO, VERDE, VERDE_ESCURO, MARROM, MARROM_ESCURO, LARANJA,
                   LARANJA_ESCURO, AMARELO, AMARELO_ESCURO, METAL, METAL_SOMBRA, METAL_BRILHO)

W = H = 64
CX = 32
CHAO = 63

# ── Aparência de cada personagem ───────────────────────────────────────────
TIPOS = {
    'samurai_jeff': dict(cabelo='coque', barba='cheia', cor_cabelo=CABELO_PRETO, camisa=VERMELHO,
                         camisa_sombra=VERMELHO_ESCURO, gola=BRANCO, calca=CINZA_ESCURO, bota=PRETO,
                         cinto=PRETO, arma='sabre', descanso=60, largura=5),
    'kanka': dict(cabelo='curto', barba='curta', cor_cabelo=CABELO_CASTANHO, camisa=AZUL_CLARO,
                  camisa_sombra=AZUL, gola=None, calca=AZUL, macacao=AZUL, bota=MARROM_ESCURO,
                  cinto=None, arma=None, descanso=None, largura=5),
    'paulinho': dict(cabelo='topete', barba='cheia', cor_cabelo=CABELO_RUIVO, camisa=VERDE,
                     camisa_sombra=VERDE_ESCURO, gola=None, calca=MARROM, bota=MARROM_ESCURO,
                     cinto=MARROM_ESCURO, arma='chave', descanso=-125, largura=6, barriga=True),
    'logmax': dict(cabelo='capacete', cor_capacete=CINZA_CLARO, barba='bigode', cor_cabelo=CABELO_PRETO,
                   camisa=LARANJA, camisa_sombra=LARANJA_ESCURO, gola=None, calca=LARANJA_ESCURO,
                   macacao=LARANJA, bota=PRETO, cinto=None, arma='marreta', descanso=70, largura=6),
    'ponssee': dict(cabelo='capacete', cor_capacete=AMARELO, barba='curta', cor_cabelo=CABELO_CASTANHO,
                    camisa=AMARELO, camisa_sombra=AMARELO_ESCURO, gola=None, calca=CINZA_ESCURO,
                    macacao=AMARELO, faixa=PRETO, bota=PRETO, cinto=None, arma=None, descanso=None, largura=6),
}


def _ponto(x, y, ang, comp):
    r = math.radians(ang)
    return x + math.cos(r) * comp, y + math.sin(r) * comp


def _retangulo_girado(d, x, y, ang, comp, larg, cor, inicio=0):
    """Retângulo que sai de (x, y) na direção `ang` (graus; 0 = frente, 90 = baixo)."""
    r = math.radians(ang)
    ux, uy = math.cos(r), math.sin(r)
    nx, ny = -uy * larg / 2, ux * larg / 2
    x0, y0 = x + ux * inicio, y + uy * inicio
    x1, y1 = x + ux * (inicio + comp), y + uy * (inicio + comp)
    d.polygon([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)], fill=cor)


def _arma(img, d, tipo, hx, hy, ang, quadro):
    """Desenha a arma presa na mão (hx, hy) apontando para `ang`."""
    if tipo == 'sabre':
        # Sabre de motosserra: cabo curto + barra longa com a corrente nas bordas.
        _retangulo_girado(d, hx, hy, ang, 5, 3, LARANJA, inicio=-2)
        _retangulo_girado(d, hx, hy, ang, 23, 5, METAL, inicio=3)
        tx, ty = _ponto(hx, hy, ang, 26)
        d.ellipse([tx - 2.5, ty - 2.5, tx + 2.5, ty + 2.5], fill=METAL)
        _retangulo_girado(d, hx, hy, ang, 21, 1, METAL_SOMBRA, inicio=5)
        r = math.radians(ang)
        nx, ny = -math.sin(r), math.cos(r)
        p = img.load()
        for k in range(4 + (quadro % 2), 27, 2):  # dentes da corrente andam a cada quadro
            for lado in (-3, 3):
                px, py = _ponto(hx, hy, ang, k)
                px, py = int(round(px + nx * lado)), int(round(py + ny * lado))
                if 0 <= px < W and 0 <= py < H:
                    p[px, py] = CINZA_ESCURO
    elif tipo == 'chave':
        # Chave de engenheiro gigante: cabo grosso + cabeça com mandíbula.
        _retangulo_girado(d, hx, hy, ang, 16, 4, METAL, inicio=-3)
        cx, cy = _ponto(hx, hy, ang, 16)
        d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=METAL)
        bx, by = _ponto(hx, hy, ang, 19)
        d.ellipse([bx - 2.5, by - 2.5, bx + 2.5, by + 2.5], fill=(0, 0, 0, 0))
        _retangulo_girado(d, hx, hy, ang, 12, 1, METAL_SOMBRA, inicio=-1)
    elif tipo == 'marreta':
        _retangulo_girado(d, hx, hy, ang, 14, 3, MARROM, inicio=-2)
        cx, cy = _ponto(hx, hy, ang, 13)
        _retangulo_girado(d, cx, cy, ang + 90, 10, 6, CINZA, inicio=-5)
    elif tipo == 'ferramenta':
        _retangulo_girado(d, hx, hy, ang, 7, 2, METAL, inicio=-1)
        cx, cy = _ponto(hx, hy, ang, 7)
        d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=METAL)
    elif tipo == 'lata':
        d.rectangle([hx - 3, hy - 5, hx + 3, hy + 3], fill=VERMELHO)
        d.rectangle([hx - 3, hy - 2, hx + 3, hy - 1], fill=AMARELO)
        d.rectangle([hx - 1, hy - 7, hx + 1, hy - 6], fill=CINZA)


def boneco(tipo, pose, quadro=0):
    """Renderiza um quadro 64x64. `pose` é um dict com os parâmetros (ver POSES)."""
    t = TIPOS[tipo]
    img = nova(W, H)
    d = draw(img)
    bob = pose.get('bob', 0)
    lean = pose.get('lean', 0)
    agacha = pose.get('agacha', 0)
    lw = t['largura']

    quadril_y = CHAO - 12 + agacha
    tronco_topo = quadril_y - 13 + bob
    cabeca_y = tronco_topo - 11
    ox = CX + lean

    # ── Braço de trás (mais escuro) ──
    ombro_x, ombro_y = ox - 1, tronco_topo + 3
    ang_tras = pose.get('braco_tras', 100)
    _retangulo_girado(d, ombro_x, ombro_y, ang_tras, 9, 3, escurecer(t['camisa'], 0.7))
    mx, my = _ponto(ombro_x, ombro_y, ang_tras, 9)
    d.rectangle([mx - 1, my - 1, mx + 1, my + 1], fill=PELE_SOMBRA)

    # ── Pernas ──
    for (dx, lift, cor) in ((pose.get('pe_tras', (-3, 0))[0], pose.get('pe_tras', (-3, 0))[1], escurecer(t['calca'], 0.75)),
                            (pose.get('pe_frente', (3, 0))[0], pose.get('pe_frente', (3, 0))[1], t['calca'])):
        hx = CX + (1 if dx > 0 else -1) + lean // 2
        px, py = CX + dx, CHAO - lift - 2
        d.line([(hx, quadril_y), (px, py)], fill=cor, width=4)
        bota = t['bota'] if cor == t['calca'] else escurecer(t['bota'], 0.8)
        d.rectangle([px - 2, py - 1, px + 3, py + 2], fill=bota)

    # ── Tronco ──
    d.rectangle([ox - lw, tronco_topo, ox + lw, quadril_y], fill=t['camisa'])
    d.rectangle([ox - lw, tronco_topo, ox - lw + 1, quadril_y], fill=t['camisa_sombra'])
    if t.get('macacao'):
        d.rectangle([ox - lw + 1, tronco_topo + 5, ox + lw - 1, quadril_y], fill=t['macacao'])
        d.line([(ox + 2, tronco_topo), (ox + 2, tronco_topo + 5)], fill=t['macacao'], width=2)
    if t.get('faixa'):
        d.rectangle([ox - lw, tronco_topo + 7, ox + lw, tronco_topo + 8], fill=t['faixa'])
    if t.get('gola'):
        d.polygon([(ox + 1, tronco_topo), (ox + lw, tronco_topo), (ox + 3, tronco_topo + 5)], fill=t['gola'])
    if t.get('barriga'):
        d.ellipse([ox - 2, tronco_topo + 3, ox + lw + 5, quadril_y + 1], fill=t['camisa'])
        d.ellipse([ox + lw + 1, tronco_topo + 8, ox + lw + 4, quadril_y - 1], fill=escurecer(t['camisa'], 0.85))
    if t.get('cinto'):
        d.rectangle([ox - lw, quadril_y - 2, ox + lw + (4 if t.get('barriga') else 0), quadril_y - 1], fill=t['cinto'])

    # ── Cabeça ──
    hx0, hx1 = ox - 5, ox + 6
    d.rectangle([hx0, cabeca_y, hx1, cabeca_y + 10], fill=PELE)
    d.rectangle([hx1 - 1, cabeca_y + 4, hx1 + 1, cabeca_y + 5], fill=PELE)          # nariz
    d.point((hx1 - 2, cabeca_y + 3), fill=PRETO)                                      # olho
    d.point((hx1 - 2, cabeca_y + 4), fill=PRETO)
    d.rectangle([hx0, cabeca_y + 4, hx0 + 1, cabeca_y + 6], fill=PELE_SOMBRA)         # orelha
    cc = t['cor_cabelo']
    cab = t['cabelo']
    if cab == 'capacete':
        d.chord([hx0 - 1, cabeca_y - 4, hx1 + 1, cabeca_y + 6], 180, 360, fill=t['cor_capacete'])
        d.rectangle([hx0 - 1, cabeca_y, hx1 + 3, cabeca_y + 1], fill=escurecer(t['cor_capacete'], 0.75))
        d.rectangle([hx0, cabeca_y + 2, hx0 + 1, cabeca_y + 4], fill=cc)
    else:
        d.rectangle([hx0, cabeca_y - 1, hx1, cabeca_y + 1], fill=cc)
        d.rectangle([hx0 - 1, cabeca_y, hx0 + 2, cabeca_y + 5], fill=cc)
        if cab == 'coque':     # coque samurai no alto da cabeça
            d.ellipse([hx0, cabeca_y - 6, hx0 + 5, cabeca_y - 1], fill=cc)
            d.rectangle([hx0 + 2, cabeca_y - 2, hx0 + 3, cabeca_y - 1], fill=VERMELHO)
        elif cab == 'topete':  # topetinho pontudo para frente
            d.polygon([(hx0 + 4, cabeca_y - 1), (hx1 + 3, cabeca_y - 5), (hx1, cabeca_y + 1)], fill=cc)
        elif cab == 'curto':
            d.rectangle([hx0 + 2, cabeca_y - 2, hx1 - 2, cabeca_y - 1], fill=cc)
    barba = t['barba']
    if barba == 'cheia':
        d.rectangle([hx0 + 3, cabeca_y + 6, hx1 + 1, cabeca_y + 11], fill=cc)
        d.rectangle([hx1 - 4, cabeca_y + 6, hx1 + 1, cabeca_y + 6], fill=cc)          # bigode
        d.point((hx1 - 1, cabeca_y + 8), fill=VERMELHO_ESCURO)                         # boca
    elif barba == 'curta':
        d.rectangle([hx0 + 4, cabeca_y + 8, hx1, cabeca_y + 10], fill=cc)
        d.rectangle([hx1 - 3, cabeca_y + 6, hx1, cabeca_y + 6], fill=cc)
    elif barba == 'bigode':
        d.rectangle([hx1 - 4, cabeca_y + 6, hx1 + 1, cabeca_y + 7], fill=cc)

    # ── Braço da frente + arma ──
    ombro_x = ox + 1
    ang = pose.get('braco', 80)
    _retangulo_girado(d, ombro_x, ombro_y, ang, 9, 3, t['camisa'])
    mx, my = _ponto(ombro_x, ombro_y, ang, 10)
    arma = pose.get('arma', t['arma'])
    ang_arma = pose.get('ang_arma', ang)
    if arma:
        _arma(img, d, arma, mx, my, ang_arma, quadro)
    d.rectangle([mx - 1, my - 1, mx + 1, my + 1], fill=PELE)

    img = contorno(img)
    rot = pose.get('rot', 0)
    if rot:
        # Gira em torno dos pés (para quedas/morte) e reposiciona no chão.
        img = img.rotate(-rot, resample=Image.NEAREST, center=(CX, CHAO - 4))
        if abs(rot) >= 60:
            caixa = img.getbbox()
            if caixa:
                desl = CHAO - caixa[3]
                deslocada = nova(W, H)
                deslocada.paste(img, (0, desl), img)
                img = deslocada
    return img


# ── Poses ──────────────────────────────────────────────────────────────────

def _correndo(n, amplitude=5, pesado=False):
    quadros = []
    for i in range(n):
        p = i / n * math.tau
        s, c = math.sin(p), math.cos(p)
        quadros.append(dict(
            pe_frente=(round(amplitude * s), round(max(0, c) * 3)),
            pe_tras=(round(-amplitude * s), round(max(0, -c) * 3)),
            bob=-1 if abs(s) > 0.7 else 0, lean=1 if not pesado else 0,
            braco=round(80 - 45 * s), braco_tras=round(95 + 45 * s)))
    return quadros


def _arma_descanso(tipo):
    return TIPOS[tipo]['descanso']


def poses(tipo, anim, n):
    descanso = _arma_descanso(tipo)
    base_braco = descanso if descanso is not None else 80
    pesado = tipo == 'paulinho'

    if anim == 'parado':
        return [dict(bob=b, braco=base_braco, braco_tras=100) for b in (0, 0, 1, 1)][:n]
    if anim in ('correndo', 'andando'):
        lista = _correndo(n, amplitude=4 if anim == 'andando' else 5, pesado=pesado)
        if descanso is not None:
            for q in lista:
                q['braco'] = descanso + (q['braco'] - 80) // 4
        return lista
    if anim == 'pulo':
        return [dict(pe_frente=(4, 6), pe_tras=(-3, 2), braco=-30 if descanso is None else descanso - 20, braco_tras=-60 + k * 10, bob=-1) for k in range(n)]
    if anim == 'queda':
        return [dict(pe_frente=(3, 1 + k), pe_tras=(-4, 3), braco=-10 + k * 10 if descanso is None else descanso, braco_tras=-30) for k in range(n)]
    if anim == 'aterrissagem':
        return [dict(agacha=a, pe_frente=(4, 0), pe_tras=(-4, 0), braco=base_braco + 10, braco_tras=110) for a in (3, 1)][:n]
    if anim == 'dano':
        return [dict(lean=-2, bob=-1, braco=-70, braco_tras=-120, rot=-8 - 4 * k, pe_frente=(5, 1), pe_tras=(-2, 0)) for k in range(n)]
    if anim == 'morte':
        rots = [-10, -30, -55, -80, -90, -90]
        return [dict(lean=-2, braco=-80, braco_tras=-120, rot=r, pe_frente=(5, 1), pe_tras=(-2, 0)) for r in rots][:n]
    if anim == 'vitoria':
        if tipo == 'kanka':
            return [dict(braco=-90 + k % 2 * 10, ang_arma=-90, arma='ferramenta', braco_tras=100, bob=-(k % 2)) for k in range(n)]
        return [dict(braco=-80 - k % 2 * 10, ang_arma=-95 - k % 2 * 10, braco_tras=110, bob=-(k % 2), pe_frente=(5, 0), pe_tras=(-5, 0)) for k in range(n)]
    if anim == 'alerta':
        return [dict(braco=-60, braco_tras=-110, bob=-2, pe_frente=(3, 2), pe_tras=(-3, 2)), dict(braco=-40, braco_tras=-100, bob=-1)][:n]

    # ── Ataques ──
    postura = dict(pe_frente=(5, 0), pe_tras=(-5, 0))
    no_ar = dict(pe_frente=(4, 6), pe_tras=(-3, 3))
    if tipo == 'samurai_jeff':
        angs = {'ataque': [-130, -60, 0, 45, 70, 80], 'ataque_2': [80, 45, 0, -60, -100, -110],
                'ataque_ar': [-90, -45, 30, 135, 200]}[anim]
        extra = no_ar if anim == 'ataque_ar' else postura
        return [dict(braco=a if a < 150 else a - 360, braco_tras=110, lean=2 if 1 <= i <= 3 else 0, **extra) for i, a in enumerate(angs)][:n]
    if tipo == 'paulinho':
        angs = {'ataque': [-100, -130, -150, -160, 20, 50, 60, 40], 'ataque_ar': [-120, -150, -40, 40, 60, 50]}[anim]
        extra = no_ar if anim == 'ataque_ar' else postura
        return [dict(braco=a, braco_tras=110, agacha=2 if anim == 'ataque' and i in (4, 5) else 0,
                     lean=2 if i in (4, 5) else -1 if i in (2, 3) else 0, **extra) for i, a in enumerate(angs)][:n]
    if tipo == 'kanka':  # arremesso / arremesso_ar
        extra = no_ar if anim == 'arremesso_ar' else postura
        seq = [dict(braco=-130, arma='ferramenta', ang_arma=-130), dict(braco=-20, arma=None), dict(braco=0, arma=None), dict(braco=40, arma=None)]
        return [dict(braco_tras=110, lean=1 if i else -1, **extra, **q) for i, q in enumerate(seq)][:n]
    if tipo == 'logmax':  # ataque
        angs = [-110, -140, -20, 40, 70, 80]
        return [dict(braco=a, braco_tras=110, lean=2 if i in (2, 3) else 0, **postura) for i, a in enumerate(angs)][:n]
    if tipo == 'ponssee':  # arremesso (a lata sai no quadro 2)
        seq = [dict(braco=-100, arma='lata'), dict(braco=-150, arma='lata'), dict(braco=-30, arma=None),
               dict(braco=10, arma=None), dict(braco=60, arma=None)]
        return [dict(braco_tras=110, **postura, **q) for q in seq][:n]
    raise ValueError(f'pose desconhecida: {tipo}/{anim}')


def gerar(tipo, anim, n):
    lista = poses(tipo, anim, n)
    while len(lista) < n:
        lista.append(lista[-1])
    return tira([boneco(tipo, p, i) for i, p in enumerate(lista)])
