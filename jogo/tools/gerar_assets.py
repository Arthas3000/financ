#!/usr/bin/env python3
"""Gera os assets do jogo a partir de assets/manifest.json.

Uso (dentro da pasta jogo/):
    python3 tools/gerar_assets.py            # cria SÓ os arquivos que ainda não existem
    python3 tools/gerar_assets.py --forcar   # recria tudo (CUIDADO: sobrescreve sua arte)
    python3 tools/gerar_assets.py --tabela   # só atualiza ASSETS.md
    python3 tools/gerar_assets.py --forcar ui/logo.png audio/musica/titulo.wav   # recria arquivos específicos

Assim, você pode substituir os placeholders pela sua arte à vontade: rodar o gerador de
novo não apaga nada que já existe. Requer: Python 3.9+, Pillow e numpy.
"""

import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ASSETS = RAIZ / 'assets'
sys.path.insert(0, str(Path(__file__).resolve().parent))

from arte import fonte, menu, personagens, cenario, diversos  # noqa: E402
from som import musicas, sfx, sintetizador  # noqa: E402


def gerar_imagem(arq, item):
    partes = arq[:-4].split('/')
    pasta, nome = partes[0], partes[-1]
    fw, fh = item.get('quadro', item.get('tamanho', [0, 0]))
    n = item.get('quadros', 1)

    if pasta == 'fontes':
        return fonte.gerar_fonte(nome.replace('fonte_', ''))[0]
    if pasta == 'ui':
        if nome.startswith('retrato_'):
            return menu.retrato(nome[len('retrato_'):])
        if nome.startswith('icone_'):
            return menu.icone(nome[len('icone_'):])
        especiais = {
            'botao': lambda: menu.botao(False),
            'botao_selecionado': lambda: personagens.tira([menu.botao(True, q) for q in range(n)]),
            'card': lambda: menu.card(False),
            'card_selecionado': lambda: personagens.tira([menu.card(True, q) for q in range(n)]),
            'status_cheio': lambda: menu.status(True),
            'status_vazio': lambda: menu.status(False),
        }
        if nome in especiais:
            return especiais[nome]()
        return getattr(menu, nome)()
    if pasta == 'hud':
        if nome.startswith('retrato_'):
            return menu.retrato_hud(nome[len('retrato_'):])
        return diversos.hud(nome, fw, fh)
    if pasta in ('personagens', 'inimigos'):
        return personagens.gerar(partes[1], nome, n)
    if pasta == 'projeteis':
        return diversos.projetil(nome)
    if pasta == 'efeitos':
        return diversos.efeito(nome, fw, fh, n)
    if pasta == 'itens':
        return diversos.item(nome, fw, fh, n)
    if pasta == 'cenarios':
        fase = partes[1]
        if nome.startswith('parallax_'):
            return cenario.parallax(fase, int(nome.split('_')[1]))
        if nome == 'tileset':
            return cenario.tileset(fase)
        return cenario.decoracao(fase, nome, fw, fh)
    raise ValueError(f'Sem gerador para {arq}')


def gerar_audio(arq):
    nome = Path(arq).stem
    if '/musica/' in arq:
        return musicas.MUSICAS[nome]()
    return sfx.gerar(nome)


def conferir_tamanho(arq, img, item):
    if 'quadro' in item:
        esperado = (item['quadro'][0] * item.get('quadros', 1), item['quadro'][1])
    elif 'tamanho' in item:
        esperado = tuple(item['tamanho'])
    else:
        return
    if img.size != esperado:
        raise ValueError(f'{arq}: gerado {img.size}, manifesto pede {esperado}')


def main(args):
    manifesto = json.loads((ASSETS / 'manifest.json').read_text(encoding='utf-8'))
    forcar = '--forcar' in args
    alvos = {a for a in args if not a.startswith('--')}
    so_tabela = '--tabela' in args
    criados = 0

    def deve_gerar(arq):
        if alvos:
            return arq in alvos
        return forcar or not (ASSETS / arq).exists()

    if not so_tabela:
        for arq in manifesto['dados']:
            if deve_gerar(arq) and arq == 'fontes/fonte.json':
                (ASSETS / arq).parent.mkdir(parents=True, exist_ok=True)
                (ASSETS / arq).write_text(fonte.gerar_json(), encoding='utf-8')
                criados += 1
        for grupo in manifesto['imagens']:
            for item in grupo['itens']:
                arq = item['arquivo']
                if not deve_gerar(arq):
                    continue
                img = gerar_imagem(arq, item)
                conferir_tamanho(arq, img, item)
                destino = ASSETS / arq
                destino.parent.mkdir(parents=True, exist_ok=True)
                img.save(destino, optimize=True)
                criados += 1
                print('  imagem', arq)
        for grupo in manifesto['audio']:
            for item in grupo['itens']:
                arq = item['arquivo']
                if not deve_gerar(arq):
                    continue
                destino = ASSETS / arq
                destino.parent.mkdir(parents=True, exist_ok=True)
                sintetizador.salvar_wav(destino, gerar_audio(arq))
                criados += 1
                print('  áudio ', arq)
        print(f'{criados} arquivo(s) gerado(s).')

    (RAIZ / 'ASSETS.md').write_text(tabela(manifesto), encoding='utf-8')
    print('ASSETS.md atualizado.')


# ───────────────────────────── ASSETS.md ─────────────────────────────

STATUS = {'final': '✅ pronto', 'provisorio': '🟧 provisório'}


def tabela(manifesto):
    linhas = [
        '# Lista de assets — Fúria na Floresta',
        '',
        '> Gerado automaticamente por `tools/gerar_assets.py` a partir de `assets/manifest.json`. '
        'Para mudar tamanhos/quadros/FPS, edite o manifesto e rode `python3 tools/gerar_assets.py --tabela`.',
        '',
        '**Legenda de status:** ✅ pronto = arte/som final já feito (menus, fontes, músicas de menu) · '
        '🟧 provisório = placeholder gerado por código para o jogo funcionar — **substitua pelo seu arquivo com o mesmo nome e tamanho**.',
        '',
        '## Regras para desenhar os sprites',
        '',
        '- **Formato:** PNG com transparência. Pixel art sem antisserrilhado (o jogo amplia com "vizinho mais próximo").',
        '- **Tiras horizontais:** animações são N quadros lado a lado, todos do mesmo tamanho. '
        'Largura do PNG = largura do quadro × nº de quadros. Ex.: `correndo.png` com 8 quadros de 64×64 = **512×64**.',
        '- **Personagens e inimigos (64×64):** desenhe olhando para a **direita** (o jogo espelha). '
        'Os **pés tocam a última linha de pixels**, centralizados em x = 32. O corpo tem ~14×34 px '
        '(Paulinho ~18×34) — o espaço que sobra no quadro é para armas e golpes.',
        '- **Projéteis:** desenhe apontando para a direita, centralizados; o jogo gira a imagem no voo.',
        '- **Parallax (384×240):** a borda esquerda tem que emendar com a direita (a imagem se repete). '
        'A camada `primeiro_plano` fica na frente do jogador: deixe quase tudo transparente.',
        '- **Hitboxes:** os quadros que causam dano estão na coluna *Situação*. '
        'Depois de trocar a arte, abra o jogo com `?debug` na URL para ver as caixas de golpe e ajuste em `src/config/characters.js` / `enemies.js`.',
        '- **Paleta:** inspirada no NES/Mega Man — cores chapadas, contorno escuro de 1 px, poucos tons por material.',
        '',
    ]
    for grupo in manifesto['imagens']:
        linhas += [f'## {grupo["grupo"]}', '', '| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |',
                   '|---|---|---|---|---|---|---|']
        for it in grupo['itens']:
            if 'quadro' in it:
                w, h = it['quadro']
                tam = f'{w}×{h} (tira {w * it.get("quadros", 1)}×{h})'
            elif 'tamanho' in it:
                tam = '{}×{}'.format(*it['tamanho'])
            else:
                tam = '—'
            q = it.get('quadros', 1)
            fps = it.get('fps', '—') if q > 1 else '—'
            loop = ('sim' if it.get('loop') else 'não') if q > 1 else '—'
            linhas.append(f'| `{it["arquivo"]}` | {it["situacao"]} | {tam} | {q} | {fps} | {loop} | {STATUS[it["status"]]} |')
        linhas.append('')
    linhas += TILESET_MD
    for grupo in manifesto['audio']:
        linhas += [f'## {grupo["grupo"]}', '', '| Arquivo | Situação | Loop | Status |', '|---|---|---|---|']
        for it in grupo['itens']:
            linhas.append(f'| `{it["arquivo"]}` | {it["situacao"]} | {"sim" if it.get("loop") else "não"} | {STATUS[it["status"]]} |')
        linhas.append('')
    linhas += EXTRAS_MD
    return '\n'.join(linhas) + '\n'


TILESET_MD = [
    '## Tileset (`cenarios/faseN/tileset.png`, 64×64 = grade 4×4 de tiles 16×16)',
    '',
    'O jogo escolhe sozinho qual tile usar (bordas, grama no topo...). Mantenha **a mesma posição** de cada tile nas duas fases.',
    '',
    '| Posição (coluna, linha) | Índice | Tile |',
    '|---|---|---|',
    '| (0,0) | 0 | Chão com grama — borda esquerda |',
    '| (1,0) | 1 | Chão com grama — meio |',
    '| (2,0) | 2 | Chão com grama — borda direita |',
    '| (3,0) | 3 | Chão com grama — coluna isolada (bordas dos dois lados) |',
    '| (0,1) | 4 | Terra (interior) — borda esquerda |',
    '| (1,1) | 5 | Terra (interior) — meio |',
    '| (2,1) | 6 | Terra (interior) — borda direita |',
    '| (3,1) | 7 | Terra (interior) — coluna isolada |',
    '| (0,2) | 8 | Bloco de pular (sólido) |',
    '| (1,2) | 9 | Ponte de tronco — ponta esquerda (atravessável por baixo; superfície na borda de cima) |',
    '| (2,2) | 10 | Ponte de tronco — meio |',
    '| (3,2) | 11 | Ponte de tronco — ponta direita |',
    '| (0,3) | 12 | Toco de árvore — topo (anéis) |',
    '| (1,3) | 13 | Toco de árvore — corpo |',
    '| (2,3) | 14 | Troncos empilhados (pontas cortadas) |',
    '| (3,3) | 15 | Terra — variação com raízes (aparece aleatoriamente) |',
    '',
]

EXTRAS_MD = [
    '## Assets que eu acrescentei além da sua lista (e por quê)',
    '',
    '- **Paulinho completo** (sprites, retrato, ícone da chave de engenheiro) — ele não estava na lista de assets, só na descrição.',
    '- **Lata de óleo + respingo** — o Ponssee precisava de um ataque à distância diferente do LogMax.',
    '- **Animações extras de inimigo:** `alerta` (o “!” quando te vê), `correndo` (LogMax perseguindo), `ataque`/`arremesso`, `dano`, `morte`.',
    '- **Animações extras de personagem:** `aterrissagem`, `ataque_2` (combo do Jeff), `ataque_ar`, `dano`, `morte`, `vitoria`.',
    '- **Efeitos:** poeira de pulo/aterrissagem, faíscas, serragem do sabre, onda de impacto do Paulinho, orbes de explosão estilo Mega Man, fumaça.',
    '- **Itens:** marmita (recupera vida), placa de checkpoint (inativa/ativa), bandeira de fim de fase.',
    '- **HUD:** moldura + retratos pequenos, barra de vida vertical estilo Mega Man.',
    '- **Cenário:** camada de primeiro plano (parallax na frente do jogador), tocos, troncos empilhados, ponte de tronco, decorações (árvore, arbusto, samambaia, pedra, cogumelo, placa).',
    '',
    '## Sugestões de arte para o futuro (ainda não usadas pelo código)',
    '',
    '- Chefe de fim de fase (ex.: “Mestre LogMax” pilotando um harvester) — tamanho sugerido 128×96.',
    '- Tela de “Fase 2” com arte própria (hoje usa a faixa genérica).',
    '- Retratos grandes (ilustração de corpo inteiro) para a seleção de personagens.',
    '- Botões de toque (direcional, pulo, ataque) caso queira jogar no celular.',
    '- Tiles de declive/rampa e água/lama (exigiriam física nova).',
]


if __name__ == '__main__':
    main(sys.argv[1:])
