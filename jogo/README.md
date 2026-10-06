# Fúria na Floresta

Plataforma 2D side-scroller em pixel art (estética 16-bit inspirada em Mega Man, menus de fliperama no estilo Metal Slug).
JavaScript puro (ES modules) + Canvas 2D — **sem dependências** e sem etapa de build.

- **Personagens:** Samurai Jeff (corpo a corpo, Sabre da Oregon), Kanka (à distância, ferramentas em parábola), Paulinho (pesado, Chave de Engenheiro).
- **Fase 1:** Floresta de Pinus — só mecânicos **LogMax** (correm atrás e batem).
- **Fase 2:** Floresta de Eucalipto — só mecânicos **Ponssee** (mantêm distância e arremessam latas de óleo).
- **Toda a arte e todo o som vêm de arquivos em `assets/`.** O código só posiciona, espelha e gira imagens. A lista completa de assets, com tamanhos e quadros, está em **[ASSETS.md](ASSETS.md)**.

## Como rodar

O navegador bloqueia módulos JS abertos direto do disco (`file://`), então use um servidor local na pasta `jogo/`:

```bash
cd jogo
python3 -m http.server 8000
# abra http://localhost:8000
```

No GitHub Pages fica em `https://<usuário>.github.io/<repositório>/jogo/`.

Parâmetros úteis na URL: `?debug` (mostra hitboxes e caixas de colisão) · `?fase=2` (começa na fase 2).

## Controles

| Ação | Teclado | Controle |
|---|---|---|
| Andar | ← → ou A D | Direcional / analógico |
| Pular (segure para pular mais alto) | Z, Espaço ou J | A / ✕ |
| Atacar | X ou K | X / □ ou B / ○ |
| Mirar o arremesso (Kanka) | ↑ arco alto · ↓ no ar = rasante | Direcional |
| Descer da ponte de tronco | ↓ + pulo | ↓ + A |
| Pausa | Enter ou Esc | Start |
| Ligar/desligar som | M | — |

Menus também funcionam com mouse/toque (passar por cima seleciona, clicar confirma).

## Estrutura

```
jogo/
├── index.html            só hospeda o <canvas>
├── assets/
│   └── manifest.json     FONTE ÚNICA DE VERDADE dos assets (tamanho, quadros, fps, loop)
├── src/
│   ├── main.js           inicialização
│   ├── config/           todos os números de jogabilidade (edite aqui para ajustar o "feeling")
│   │   ├── constants.js  resolução, tile, regras de fliperama
│   │   ├── characters.js personagens: física, hitboxes por quadro, arremessos
│   │   ├── enemies.js    inimigos: vida, velocidade, alcance de visão, ataques
│   │   └── phases.js     ordem das fases e camadas de parallax
│   ├── core/             motor: loop de passo fixo, entrada, áudio, assets, câmera, animação, fonte
│   ├── world/            Level (mapa ASCII + autotile), Physics (colisão AABB), Parallax, levels/
│   ├── entities/         Player (+ characters/), enemies/, projéteis, itens, efeitos
│   ├── scenes/           Boot → Title → Select → Game → Continue / Ending
│   └── ui/               ButtonMenu (menus), Hud
└── tools/
    └── gerar_assets.py   gera placeholders/menus/sons e escreve ASSETS.md
```

### Loop principal
`core/Game.js` roda a simulação em **passo fixo de 60 Hz** (acumulador), independente da taxa do monitor — o pulo tem a mesma altura em 60 Hz ou 144 Hz. O desenho acontece uma vez por quadro do navegador. A troca de cenas usa fade.

### Física e "game feel"
- `world/Physics.js`: colisão AABB contra a grade de tiles, resolvendo X e depois Y (método clássico de plataforma). Tiles sólidos e **pontes atravessáveis por baixo** (one-way).
- `entities/Player.js`: aceleração/desaceleração separadas, curva mais forte ao virar, **coyote time**, **jump buffer**, **pulo variável** (soltar o botão corta a subida), gravidade maior na queda, "flutuar" no topo do pulo, **hitstop** e tremor de tela nos golpes.
- A altura do pulo é definida em pixels e tempo até o topo (`jumpHeight`, `timeToApex`); o código calcula gravidade e impulso exatos.

### Projéteis do Kanka (`entities/ToolProjectile.js`)
Velocidade inicial decomposta a partir de ângulo e força (`aim` em `characters.js`) + gravidade constante → trajetória parabólica real. Cada ferramenta tem peso próprio (`gravityScale`), gira no ar, herda parte da velocidade do Kanka e quica uma vez no chão perdendo energia. As latas do Ponssee fazem o inverso: resolvem a equação do movimento para **cair onde o jogador vai estar**.

### Hitboxes
Definidas por **quadro de animação** em `config/characters.js` / `config/enemies.js`, relativas aos pés do personagem olhando para a direita (o código espelha). Quando você trocar os sprites (por exemplo, o Sabre da Oregon a partir da sua imagem de referência), abra com `?debug` e ajuste os retângulos vermelhos até cobrirem a lâmina nos quadros de golpe.

## Trocando a arte e o som

1. Veja em **ASSETS.md** o nome, o tamanho e o número de quadros de cada arquivo.
2. Salve seu PNG/WAV **com o mesmo nome** por cima do placeholder.
3. Mudou a quantidade de quadros ou o FPS? Edite `assets/manifest.json` (e rode `python3 tools/gerar_assets.py --tabela` para atualizar a tabela).

O gerador **nunca sobrescreve** arquivos existentes, a menos que você peça (`--forcar`). Para recriar algo específico:
`python3 tools/gerar_assets.py --forcar audio/musica/titulo.wav`. Requer Python 3 com Pillow e numpy.

## Criando ou editando fases

As fases são texto em `src/world/levels/`. Cada fase é uma lista de **trechos** de 15 linhas colados lado a lado — dá para reordenar, duplicar ou criar trechos novos. Legenda:

| Letra | Significado | Letra | Significado |
|---|---|---|---|
| `#` | chão (grama automática no topo) | `P` | início do jogador |
| `B` | bloco de pular | `E` | inimigo da fase |
| `=` | ponte de tronco (atravessável por baixo) | `M` | marmita (recupera vida) |
| `L` | troncos empilhados | `K` | checkpoint |
| `T` | toco de árvore | `F` | fim da fase |
| `t a s r c p` | decorações: árvore, arbusto, samambaia, pedra, cogumelo, placa | `.` | vazio |

Regras de medida (para todos os personagens conseguirem passar): o jogador tem 34 px de altura, então blocos sobre um caminho precisam de **3 linhas livres** embaixo; o Paulinho pula ~50 px de altura e ~55 px de distância — degraus de até 2 tiles e buracos de até 2–3 tiles.

Para adicionar uma fase 3: crie `levels/fase3.js`, a pasta `assets/cenarios/fase3/` (mesmos arquivos da fase 1), as entradas no `manifest.json` e uma linha em `config/phases.js`.
