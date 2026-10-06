# Lista de assets — Fúria na Floresta

> Gerado automaticamente por `tools/gerar_assets.py` a partir de `assets/manifest.json`. Para mudar tamanhos/quadros/FPS, edite o manifesto e rode `python3 tools/gerar_assets.py --tabela`.

**Legenda de status:** ✅ pronto = arte/som final já feito (menus, fontes, músicas de menu) · 🟧 provisório = placeholder gerado por código para o jogo funcionar — **substitua pelo seu arquivo com o mesmo nome e tamanho**.

## Regras para desenhar os sprites

- **Formato:** PNG com transparência. Pixel art sem antisserrilhado (o jogo amplia com "vizinho mais próximo").
- **Tiras horizontais:** animações são N quadros lado a lado, todos do mesmo tamanho. Largura do PNG = largura do quadro × nº de quadros. Ex.: `correndo.png` com 8 quadros de 64×64 = **512×64**.
- **Personagens e inimigos (64×64):** desenhe olhando para a **direita** (o jogo espelha). Os **pés tocam a última linha de pixels**, centralizados em x = 32. O corpo tem ~14×34 px (Paulinho ~18×34) — o espaço que sobra no quadro é para armas e golpes.
- **Projéteis:** desenhe apontando para a direita, centralizados; o jogo gira a imagem no voo.
- **Parallax (384×240):** a borda esquerda tem que emendar com a direita (a imagem se repete). A camada `primeiro_plano` fica na frente do jogador: deixe quase tudo transparente.
- **Hitboxes:** os quadros que causam dano estão na coluna *Situação*. Depois de trocar a arte, abra o jogo com `?debug` na URL para ver as caixas de golpe e ajuste em `src/config/characters.js` / `enemies.js`.
- **Paleta:** inspirada no NES/Mega Man — cores chapadas, contorno escuro de 1 px, poucos tons por material.

## Fontes (tipografia pixelada)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `fontes/fonte_branca.png` | Fonte pixelada 5x7 com contorno — branca | — | 1 | — | — | ✅ pronto |
| `fontes/fonte_amarela.png` | Fonte pixelada — amarela (destaques) | — | 1 | — | — | ✅ pronto |
| `fontes/fonte_vermelha.png` | Fonte pixelada — vermelha (alertas) | — | 1 | — | — | ✅ pronto |
| `fontes/fonte_ciano.png` | Fonte pixelada — ciano (informações) | — | 1 | — | — | ✅ pronto |
| `fontes/fonte_cinza.png` | Fonte pixelada — cinza (desativado) | — | 1 | — | — | ✅ pronto |
| `fontes/fonte_metal.png` | Fonte pixelada — gradiente metálico (títulos estilo fliperama) | — | 1 | — | — | ✅ pronto |

## Interface — Menus

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `ui/carregando_moldura.png` | Moldura da barra de carregamento | 128×10 | 1 | — | — | ✅ pronto |
| `ui/carregando_barra.png` | Preenchimento da barra de carregamento | 124×6 | 1 | — | — | ✅ pronto |
| `ui/logo.png` | Logo do jogo (tela inicial) | 320×112 | 1 | — | — | ✅ pronto |
| `ui/vinheta.png` | Escurecimento das bordas sobre o fundo da tela inicial | 384×216 | 1 | — | — | ✅ pronto |
| `ui/botao.png` | Botão de menu — normal | 128×20 | 1 | — | — | ✅ pronto |
| `ui/botao_selecionado.png` | Botão de menu — selecionado (brilho correndo) | 128×20 (tira 768×20) | 6 | 12 | sim | ✅ pronto |
| `ui/cursor.png` | Cursor/seta de seleção (pulsando) | 16×16 (tira 64×16) | 4 | 10 | sim | ✅ pronto |
| `ui/painel.png` | Painel genérico 9-slice (pausa, confirmação). Bordas de 8 px | 24×24 | 1 | — | — | ✅ pronto |
| `ui/faixa.png` | Faixa/banner de anúncio (FASE 1, MISSÃO COMPLETA...) | 384×40 | 1 | — | — | ✅ pronto |
| `ui/selecao_fundo.png` | Fundo da tela de seleção de personagens | 384×216 | 1 | — | — | ✅ pronto |
| `ui/card.png` | Card de personagem — normal | 116×152 | 1 | — | — | ✅ pronto |
| `ui/card_selecionado.png` | Card de personagem — selecionado (piscando) | 116×152 (tira 232×152) | 2 | 6 | sim | ✅ pronto |
| `ui/retrato_samurai_jeff.png` | Retrato do Samurai Jeff (seleção) | 64×64 | 1 | — | — | ✅ pronto |
| `ui/retrato_kanka.png` | Retrato do Kanka (seleção) | 64×64 | 1 | — | — | ✅ pronto |
| `ui/retrato_paulinho.png` | Retrato do Paulinho (seleção) | 64×64 | 1 | — | — | ✅ pronto |
| `ui/icone_sabre_oregon.png` | Ícone da arma: Sabre da Oregon | 32×16 | 1 | — | — | ✅ pronto |
| `ui/icone_ferramentas.png` | Ícone da arma: ferramentas arremessáveis | 32×16 | 1 | — | — | ✅ pronto |
| `ui/icone_chave_engenheiro.png` | Ícone da arma: Chave de Engenheiro | 32×16 | 1 | — | — | ✅ pronto |
| `ui/status_cheio.png` | Segmento de barra de status — cheio | 8×6 | 1 | — | — | ✅ pronto |
| `ui/status_vazio.png` | Segmento de barra de status — vazio | 8×6 | 1 | — | — | ✅ pronto |

## HUD (durante a fase)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `hud/moldura_retrato.png` | Moldura do retrato no canto da tela | 24×24 | 1 | — | — | 🟧 provisório |
| `hud/retrato_samurai_jeff.png` | Retrato pequeno do Samurai Jeff | 20×20 | 1 | — | — | 🟧 provisório |
| `hud/retrato_kanka.png` | Retrato pequeno do Kanka | 20×20 | 1 | — | — | 🟧 provisório |
| `hud/retrato_paulinho.png` | Retrato pequeno do Paulinho | 20×20 | 1 | — | — | 🟧 provisório |
| `hud/barra_vida.png` | Moldura vertical da barra de vida (estilo Mega Man, 28 marcas) | 10×62 | 1 | — | — | 🟧 provisório |
| `hud/vida_cheia.png` | Marca de vida cheia | 6×1 | 1 | — | — | 🟧 provisório |
| `hud/vida_vazia.png` | Marca de vida vazia | 6×1 | 1 | — | — | 🟧 provisório |

## Personagem — Samurai Jeff (corpo a corpo)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `personagens/samurai_jeff/parado.png` | Parado (respirando) | 64×64 (tira 256×64) | 4 | 6 | sim | 🟧 provisório |
| `personagens/samurai_jeff/correndo.png` | Correndo/andando | 64×64 (tira 512×64) | 8 | 14 | sim | 🟧 provisório |
| `personagens/samurai_jeff/pulo.png` | Pulo (subindo) | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/samurai_jeff/queda.png` | Caindo | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/samurai_jeff/aterrissagem.png` | Aterrissando (agacha rápido) | 64×64 (tira 128×64) | 2 | 20 | não | 🟧 provisório |
| `personagens/samurai_jeff/ataque.png` | Golpe 1 do sabre (de cima para baixo). Quadros 1–3 causam dano | 64×64 (tira 384×64) | 6 | 18 | não | 🟧 provisório |
| `personagens/samurai_jeff/ataque_2.png` | Golpe 2 do combo (de baixo para cima). Quadros 1–3 causam dano | 64×64 (tira 384×64) | 6 | 18 | não | 🟧 provisório |
| `personagens/samurai_jeff/ataque_ar.png` | Giro com o sabre no ar. Quadros 1–3 causam dano | 64×64 (tira 320×64) | 5 | 18 | não | 🟧 provisório |
| `personagens/samurai_jeff/dano.png` | Tomando dano | 64×64 (tira 128×64) | 2 | 12 | não | 🟧 provisório |
| `personagens/samurai_jeff/morte.png` | Morrendo (cai no chão) | 64×64 (tira 384×64) | 6 | 10 | não | 🟧 provisório |
| `personagens/samurai_jeff/vitoria.png` | Comemorando (fim de fase / personagem escolhido) | 64×64 (tira 256×64) | 4 | 8 | sim | 🟧 provisório |

## Personagem — Kanka (à distância)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `personagens/kanka/parado.png` | Parado (respirando) | 64×64 (tira 256×64) | 4 | 6 | sim | 🟧 provisório |
| `personagens/kanka/correndo.png` | Correndo/andando | 64×64 (tira 512×64) | 8 | 14 | sim | 🟧 provisório |
| `personagens/kanka/pulo.png` | Pulo (subindo) | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/kanka/queda.png` | Caindo | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/kanka/aterrissagem.png` | Aterrissando | 64×64 (tira 128×64) | 2 | 20 | não | 🟧 provisório |
| `personagens/kanka/arremesso.png` | Arremessando ferramenta no chão. A ferramenta sai no quadro 1 | 64×64 (tira 256×64) | 4 | 16 | não | 🟧 provisório |
| `personagens/kanka/arremesso_ar.png` | Arremessando ferramenta no ar. A ferramenta sai no quadro 1 | 64×64 (tira 256×64) | 4 | 16 | não | 🟧 provisório |
| `personagens/kanka/dano.png` | Tomando dano | 64×64 (tira 128×64) | 2 | 12 | não | 🟧 provisório |
| `personagens/kanka/morte.png` | Morrendo | 64×64 (tira 384×64) | 6 | 10 | não | 🟧 provisório |
| `personagens/kanka/vitoria.png` | Comemorando | 64×64 (tira 256×64) | 4 | 8 | sim | 🟧 provisório |

## Personagem — Paulinho (armas pesadas)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `personagens/paulinho/parado.png` | Parado (respirando, barriga mexendo) | 64×64 (tira 256×64) | 4 | 6 | sim | 🟧 provisório |
| `personagens/paulinho/correndo.png` | Correndo/andando (pesado) | 64×64 (tira 512×64) | 8 | 12 | sim | 🟧 provisório |
| `personagens/paulinho/pulo.png` | Pulo (subindo) | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/paulinho/queda.png` | Caindo | 64×64 (tira 128×64) | 2 | 10 | sim | 🟧 provisório |
| `personagens/paulinho/aterrissagem.png` | Aterrissando (impacto pesado) | 64×64 (tira 128×64) | 2 | 16 | não | 🟧 provisório |
| `personagens/paulinho/ataque.png` | Marretada com a chave de engenheiro. 0–3 preparação, 4–5 dano + tremor, 6–7 recuperação | 64×64 (tira 512×64) | 8 | 14 | não | 🟧 provisório |
| `personagens/paulinho/ataque_ar.png` | Golpe com a chave no ar. Quadros 2–3 causam dano | 64×64 (tira 384×64) | 6 | 14 | não | 🟧 provisório |
| `personagens/paulinho/dano.png` | Tomando dano | 64×64 (tira 128×64) | 2 | 12 | não | 🟧 provisório |
| `personagens/paulinho/morte.png` | Morrendo | 64×64 (tira 384×64) | 6 | 10 | não | 🟧 provisório |
| `personagens/paulinho/vitoria.png` | Comemorando | 64×64 (tira 256×64) | 4 | 8 | sim | 🟧 provisório |

## Inimigo — Mecânico LogMax (fase 1, corpo a corpo)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `inimigos/logmax/parado.png` | Parado | 64×64 (tira 256×64) | 4 | 6 | sim | 🟧 provisório |
| `inimigos/logmax/andando.png` | Andando (patrulha) | 64×64 (tira 384×64) | 6 | 10 | sim | 🟧 provisório |
| `inimigos/logmax/correndo.png` | Correndo atrás do jogador | 64×64 (tira 384×64) | 6 | 14 | sim | 🟧 provisório |
| `inimigos/logmax/alerta.png` | Percebeu o jogador (susto) | 64×64 (tira 128×64) | 2 | 8 | não | 🟧 provisório |
| `inimigos/logmax/ataque.png` | Golpe com ferramenta. 0–1 aviso, 2–3 dano, 4–5 recuperação | 64×64 (tira 384×64) | 6 | 10 | não | 🟧 provisório |
| `inimigos/logmax/dano.png` | Tomando dano | 64×64 (tira 128×64) | 2 | 12 | não | 🟧 provisório |
| `inimigos/logmax/morte.png` | Derrotado | 64×64 (tira 384×64) | 6 | 12 | não | 🟧 provisório |

## Inimigo — Mecânico Ponssee (fase 2, à distância)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `inimigos/ponssee/parado.png` | Parado | 64×64 (tira 256×64) | 4 | 6 | sim | 🟧 provisório |
| `inimigos/ponssee/andando.png` | Andando (patrulha / recuando) | 64×64 (tira 384×64) | 6 | 10 | sim | 🟧 provisório |
| `inimigos/ponssee/alerta.png` | Percebeu o jogador | 64×64 (tira 128×64) | 2 | 8 | não | 🟧 provisório |
| `inimigos/ponssee/arremesso.png` | Arremessando lata de óleo. A lata sai no quadro 2 | 64×64 (tira 320×64) | 5 | 10 | não | 🟧 provisório |
| `inimigos/ponssee/dano.png` | Tomando dano | 64×64 (tira 128×64) | 2 | 12 | não | 🟧 provisório |
| `inimigos/ponssee/morte.png` | Derrotado | 64×64 (tira 384×64) | 6 | 12 | não | 🟧 provisório |

## Objetos / Projéteis (girados por código, desenhe apontando para a direita)

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `projeteis/chave_de_boca.png` | Chave de boca arremessada (Kanka) | 16×16 | 1 | — | — | 🟧 provisório |
| `projeteis/parafuso.png` | Parafuso arremessado (Kanka) | 16×16 | 1 | — | — | 🟧 provisório |
| `projeteis/porca.png` | Porca arremessada (Kanka) | 16×16 | 1 | — | — | 🟧 provisório |
| `projeteis/arruela.png` | Arruela arremessada (Kanka) | 16×16 | 1 | — | — | 🟧 provisório |
| `projeteis/lata_oleo.png` | Lata de óleo arremessada (inimigo Ponssee) | 16×16 | 1 | — | — | 🟧 provisório |

## Efeitos visuais

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `efeitos/poeira_pulo.png` | Poeira ao pular | 32×16 (tira 160×16) | 5 | 20 | não | 🟧 provisório |
| `efeitos/poeira_aterrissagem.png` | Poeira ao aterrissar | 32×16 (tira 160×16) | 5 | 20 | não | 🟧 provisório |
| `efeitos/faisca_acerto.png` | Faísca de golpe acertando inimigo | 32×32 (tira 128×32) | 4 | 24 | não | 🟧 provisório |
| `efeitos/faisca_metal.png` | Faísca de ferramenta quicando no chão | 16×16 (tira 48×16) | 3 | 24 | não | 🟧 provisório |
| `efeitos/serragem.png` | Partícula de serragem/lasca (sabre acertando) | 8×8 (tira 32×8) | 4 | 12 | sim | 🟧 provisório |
| `efeitos/onda_impacto.png` | Onda de impacto no chão (marretada do Paulinho) | 64×32 (tira 320×32) | 5 | 20 | não | 🟧 provisório |
| `efeitos/explosao_orbe.png` | Orbe da explosão de derrota (estilo Mega Man) | 16×16 (tira 64×16) | 4 | 16 | sim | 🟧 provisório |
| `efeitos/fumaca.png` | Fumaça ao inimigo sumir | 48×48 (tira 288×48) | 6 | 16 | não | 🟧 provisório |
| `efeitos/respingo_oleo.png` | Respingo da lata de óleo no chão | 32×16 (tira 160×16) | 5 | 16 | não | 🟧 provisório |
| `efeitos/brilho_item.png` | Brilho ao pegar item / checkpoint | 16×16 (tira 64×16) | 4 | 12 | não | 🟧 provisório |
| `efeitos/alerta.png` | Exclamação “!” sobre o inimigo que te viu | 16×16 (tira 32×16) | 2 | 8 | sim | 🟧 provisório |

## Itens e marcadores de fase

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `itens/marmita.png` | Marmita — recupera vida | 16×16 (tira 64×16) | 4 | 6 | sim | 🟧 provisório |
| `itens/checkpoint_inativo.png` | Placa de checkpoint — ainda não ativada | 32×48 | 1 | — | — | 🟧 provisório |
| `itens/checkpoint_ativo.png` | Placa de checkpoint — ativada | 32×48 (tira 128×48) | 4 | 8 | sim | 🟧 provisório |
| `itens/fim_de_fase.png` | Bandeira/placa de SAÍDA (fim da fase) | 32×64 (tira 128×64) | 4 | 8 | sim | 🟧 provisório |

## Cenário — Fase 1: Floresta de Pinus

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `cenarios/fase1/parallax_0_ceu.png` | Fundo: céu (fixo). Emenda horizontal perfeita | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/parallax_1_montanhas.png` | Fundo: montanhas (move 10% da câmera) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/parallax_2_arvores_longe.png` | Fundo: pinheiros distantes (25%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/parallax_3_arvores_meio.png` | Fundo: pinheiros médios (45%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/parallax_4_arvores_perto.png` | Fundo: troncos de pinus próximos (70%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/parallax_5_primeiro_plano.png` | Primeiro plano: mato na frente do jogador (125%). Quase todo transparente | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/tileset.png` | Blocos 16x16 da fase (grade 4x4 — ver tabela de tiles) | 64×64 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/arvore.png` | Decoração: tronco de pinus alto atrás do jogador (letra t) | 48×176 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/arbusto.png` | Decoração: arbusto (letra a) | 32×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/samambaia.png` | Decoração: samambaia (letra s) | 32×24 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/pedra.png` | Decoração: pedra (letra r) | 24×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/cogumelo.png` | Decoração: cogumelos (letra c) | 16×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase1/placa.png` | Decoração: placa de madeira com seta (letra p) | 32×32 | 1 | — | — | 🟧 provisório |

## Cenário — Fase 2: Floresta de Eucalipto

| Arquivo | Situação | Tamanho | Quadros | FPS | Loop | Status |
|---|---|---|---|---|---|---|
| `cenarios/fase2/parallax_0_ceu.png` | Fundo: céu de fim de tarde (fixo) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/parallax_1_montanhas.png` | Fundo: morros (10%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/parallax_2_arvores_longe.png` | Fundo: eucaliptos distantes (25%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/parallax_3_arvores_meio.png` | Fundo: eucaliptos médios (45%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/parallax_4_arvores_perto.png` | Fundo: troncos claros de eucalipto próximos (70%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/parallax_5_primeiro_plano.png` | Primeiro plano: folhas/cascas na frente do jogador (125%) | 384×240 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/tileset.png` | Blocos 16x16 da fase 2 (mesma grade da fase 1) | 64×64 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/arvore.png` | Decoração: tronco de eucalipto alto (letra t) | 48×176 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/arbusto.png` | Decoração: arbusto (letra a) | 32×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/samambaia.png` | Decoração: capim/folhagem (letra s) | 32×24 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/pedra.png` | Decoração: pedra (letra r) | 24×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/cogumelo.png` | Decoração: casca de eucalipto caída (letra c) | 16×16 | 1 | — | — | 🟧 provisório |
| `cenarios/fase2/placa.png` | Decoração: placa com seta (letra p) | 32×32 | 1 | — | — | 🟧 provisório |

## Tileset (`cenarios/faseN/tileset.png`, 64×64 = grade 4×4 de tiles 16×16)

O jogo escolhe sozinho qual tile usar (bordas, grama no topo...). Mantenha **a mesma posição** de cada tile nas duas fases.

| Posição (coluna, linha) | Índice | Tile |
|---|---|---|
| (0,0) | 0 | Chão com grama — borda esquerda |
| (1,0) | 1 | Chão com grama — meio |
| (2,0) | 2 | Chão com grama — borda direita |
| (3,0) | 3 | Chão com grama — coluna isolada (bordas dos dois lados) |
| (0,1) | 4 | Terra (interior) — borda esquerda |
| (1,1) | 5 | Terra (interior) — meio |
| (2,1) | 6 | Terra (interior) — borda direita |
| (3,1) | 7 | Terra (interior) — coluna isolada |
| (0,2) | 8 | Bloco de pular (sólido) |
| (1,2) | 9 | Ponte de tronco — ponta esquerda (atravessável por baixo; superfície na borda de cima) |
| (2,2) | 10 | Ponte de tronco — meio |
| (3,2) | 11 | Ponte de tronco — ponta direita |
| (0,3) | 12 | Toco de árvore — topo (anéis) |
| (1,3) | 13 | Toco de árvore — corpo |
| (2,3) | 14 | Troncos empilhados (pontas cortadas) |
| (3,3) | 15 | Terra — variação com raízes (aparece aleatoriamente) |

## Música

| Arquivo | Situação | Loop | Status |
|---|---|---|---|
| `audio/musica/titulo.wav` | Tela inicial (loop) | sim | ✅ pronto |
| `audio/musica/selecao.wav` | Seleção de personagem / continuar (loop) | sim | ✅ pronto |
| `audio/musica/fase1.wav` | Fase 1 — Floresta de Pinus (loop) | sim | 🟧 provisório |
| `audio/musica/fase2.wav` | Fase 2 — Floresta de Eucalipto (loop) | sim | 🟧 provisório |
| `audio/musica/vitoria.wav` | Vinheta de fase completa | não | ✅ pronto |
| `audio/musica/game_over.wav` | Vinheta de fim de jogo | não | ✅ pronto |
| `audio/musica/final.wav` | Tela final / créditos (loop) | sim | ✅ pronto |

## Efeitos sonoros — Menus

| Arquivo | Situação | Loop | Status |
|---|---|---|---|
| `audio/sfx/ui_mover.wav` | Mover cursor | não | ✅ pronto |
| `audio/sfx/ui_confirmar.wav` | Confirmar opção | não | ✅ pronto |
| `audio/sfx/ui_voltar.wav` | Voltar/cancelar | não | ✅ pronto |
| `audio/sfx/ui_ficha.wav` | Inserir ficha (PRESSIONE START) | não | ✅ pronto |
| `audio/sfx/ui_tique.wav` | Tique do cronômetro | não | ✅ pronto |
| `audio/sfx/ui_pronto.wav` | Personagem escolhido | não | ✅ pronto |
| `audio/sfx/ui_anuncio.wav` | Faixa de anúncio entrando (FASE 1 / VAI!) | não | ✅ pronto |

## Efeitos sonoros — Jogo

| Arquivo | Situação | Loop | Status |
|---|---|---|---|
| `audio/sfx/pulo.wav` | Pulo | não | 🟧 provisório |
| `audio/sfx/aterrissar.wav` | Aterrissar | não | 🟧 provisório |
| `audio/sfx/sabre_ataque.wav` | Sabre da Oregon girando (motosserra) | não | 🟧 provisório |
| `audio/sfx/sabre_acerto.wav` | Corrente do sabre cortando | não | 🟧 provisório |
| `audio/sfx/arremesso.wav` | Ferramenta arremessada | não | 🟧 provisório |
| `audio/sfx/ferramenta_quica.wav` | Ferramenta quicando no chão (tlim) | não | 🟧 provisório |
| `audio/sfx/ferramenta_acerto.wav` | Ferramenta acertando inimigo | não | 🟧 provisório |
| `audio/sfx/chave_giro.wav` | Chave de engenheiro girando (pesado) | não | 🟧 provisório |
| `audio/sfx/chave_impacto.wav` | Chave de engenheiro batendo no chão/inimigo | não | 🟧 provisório |
| `audio/sfx/inimigo_dano.wav` | Inimigo tomando dano | não | 🟧 provisório |
| `audio/sfx/inimigo_morte.wav` | Inimigo derrotado (explosão) | não | 🟧 provisório |
| `audio/sfx/inimigo_alerta.wav` | Inimigo percebeu o jogador | não | 🟧 provisório |
| `audio/sfx/inimigo_golpe.wav` | Golpe do LogMax | não | 🟧 provisório |
| `audio/sfx/lata_arremesso.wav` | Ponssee arremessando lata | não | 🟧 provisório |
| `audio/sfx/lata_respingo.wav` | Lata de óleo estourando | não | 🟧 provisório |
| `audio/sfx/jogador_dano.wav` | Jogador tomando dano | não | 🟧 provisório |
| `audio/sfx/jogador_morte.wav` | Jogador derrotado | não | 🟧 provisório |
| `audio/sfx/item.wav` | Pegar marmita | não | 🟧 provisório |
| `audio/sfx/checkpoint.wav` | Checkpoint ativado | não | 🟧 provisório |

## Assets que eu acrescentei além da sua lista (e por quê)

- **Paulinho completo** (sprites, retrato, ícone da chave de engenheiro) — ele não estava na lista de assets, só na descrição.
- **Lata de óleo + respingo** — o Ponssee precisava de um ataque à distância diferente do LogMax.
- **Animações extras de inimigo:** `alerta` (o “!” quando te vê), `correndo` (LogMax perseguindo), `ataque`/`arremesso`, `dano`, `morte`.
- **Animações extras de personagem:** `aterrissagem`, `ataque_2` (combo do Jeff), `ataque_ar`, `dano`, `morte`, `vitoria`.
- **Efeitos:** poeira de pulo/aterrissagem, faíscas, serragem do sabre, onda de impacto do Paulinho, orbes de explosão estilo Mega Man, fumaça.
- **Itens:** marmita (recupera vida), placa de checkpoint (inativa/ativa), bandeira de fim de fase.
- **HUD:** moldura + retratos pequenos, barra de vida vertical estilo Mega Man.
- **Cenário:** camada de primeiro plano (parallax na frente do jogador), tocos, troncos empilhados, ponte de tronco, decorações (árvore, arbusto, samambaia, pedra, cogumelo, placa).

## Sugestões de arte para o futuro (ainda não usadas pelo código)

- Chefe de fim de fase (ex.: “Mestre LogMax” pilotando um harvester) — tamanho sugerido 128×96.
- Tela de “Fase 2” com arte própria (hoje usa a faixa genérica).
- Retratos grandes (ilustração de corpo inteiro) para a seleção de personagens.
- Botões de toque (direcional, pulo, ataque) caso queira jogar no celular.
- Tiles de declive/rampa e água/lama (exigiriam física nova).
