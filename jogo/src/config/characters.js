// Definição dos personagens jogáveis.
//
// COMO LER AS HITBOXES
//   Cada caixa é {x, y, w, h} relativa aos PÉS do personagem (centro inferior do sprite),
//   olhando para a DIREITA: x positivo = para frente, y negativo = para cima.
//   Ex.: {x: 6, y: -34, w: 32, h: 16} começa 6 px à frente do centro, 34 px acima do pé.
//   Quando o personagem olha para a esquerda, o código espelha a caixa sozinho.
//   `active` diz em quais QUADROS da animação a caixa causa dano.
//   Rode com ?debug na URL para ver as caixas sobre a sua arte e ajustar os números.
//
// FÍSICA DO PULO
//   Em vez de "gravidade" e "força do pulo" soltas, definimos altura (px) e tempo até o
//   topo (s). O código calcula gravidade e velocidade exatas — muito mais fácil de ajustar.

export const CHARACTERS = {
  samurai_jeff: {
    id: 'samurai_jeff',
    name: 'SAMURAI JEFF',
    style: 'CORPO A CORPO',
    weapon: 'SABRE DA OREGON',
    sprites: 'personagens/samurai_jeff/',
    portrait: 'ui/retrato_samurai_jeff',
    hudPortrait: 'hud/retrato_samurai_jeff',
    weaponIcon: 'ui/icone_sabre_oregon',
    stats: { vida: 3, forca: 3, velocidade: 4, alcance: 2 }, // 1–5, só para a tela de seleção
    maxHp: 20,
    body: { w: 14, h: 34 },
    move: {
      maxSpeed: 125, accel: 1300, decel: 1700, turnAccel: 2800, airAccel: 950, airDecel: 450,
      jumpHeight: 60, timeToApex: 0.36, fallMultiplier: 1.55, jumpCut: 0.45, maxFall: 400,
      coyoteTime: 0.09, jumpBuffer: 0.12,
    },
    attacks: {
      // Combo de 2 golpes: apertar ataque de novo a partir do quadro `comboFrom` emenda o próximo.
      ground: {
        anim: 'ataque', moveFactor: 0.2, damage: 1, hitInterval: 0.07, knockback: 60, hitstop: 0.03,
        sound: 'sabre_ataque', hitSound: 'sabre_acerto', hitEffect: 'chips', cooldown: 0.05,
        comboFrom: 3, next: 'ground2',
        active: {
          1: { x: 2, y: -50, w: 22, h: 28 },
          2: { x: 6, y: -34, w: 32, h: 16 },
          3: { x: 4, y: -26, w: 28, h: 26 },
        },
      },
      ground2: {
        anim: 'ataque_2', moveFactor: 0.2, damage: 1, hitInterval: 0.07, knockback: 110, hitstop: 0.04,
        sound: 'sabre_ataque', hitSound: 'sabre_acerto', hitEffect: 'chips', cooldown: 0.18,
        active: {
          1: { x: 4, y: -26, w: 28, h: 26 },
          2: { x: 6, y: -34, w: 32, h: 16 },
          3: { x: 2, y: -50, w: 22, h: 28 },
        },
      },
      // Giro no ar: acerta os dois lados.
      air: {
        anim: 'ataque_ar', moveFactor: 1, damage: 1, hitInterval: 0.07, knockback: 80, hitstop: 0.03,
        sound: 'sabre_ataque', hitSound: 'sabre_acerto', hitEffect: 'chips', cooldown: 0.12,
        active: {
          1: { x: -8, y: -50, w: 40, h: 22 },
          2: { x: -28, y: -42, w: 60, h: 24 },
          3: { x: -30, y: -30, w: 58, h: 28 },
        },
      },
    },
  },

  kanka: {
    id: 'kanka',
    name: 'KANKA',
    style: 'À DISTÂNCIA',
    weapon: 'CHAVES, PARAFUSOS E PORCAS',
    weaponShort: 'FERRAMENTAS', // versão curta que cabe no card
    sprites: 'personagens/kanka/',
    portrait: 'ui/retrato_kanka',
    hudPortrait: 'hud/retrato_kanka',
    weaponIcon: 'ui/icone_ferramentas',
    stats: { vida: 2, forca: 2, velocidade: 5, alcance: 5 },
    maxHp: 16,
    body: { w: 14, h: 34 },
    move: {
      maxSpeed: 135, accel: 1400, decel: 1800, turnAccel: 3000, airAccel: 1050, airDecel: 500,
      jumpHeight: 64, timeToApex: 0.37, fallMultiplier: 1.5, jumpCut: 0.45, maxFall: 400,
      coyoteTime: 0.09, jumpBuffer: 0.12,
    },
    attacks: {
      ground: { anim: 'arremesso', moveFactor: 0.45, cooldown: 0.22, throwFrame: 1, sound: 'arremesso' },
      air: { anim: 'arremesso_ar', moveFactor: 1, cooldown: 0.22, throwFrame: 1, sound: 'arremesso' },
    },
    // Física das ferramentas (trajetória parabólica real: velocidade inicial + gravidade constante).
    throwing: {
      maxOnScreen: 3,
      handOffset: { x: 10, y: -26 },  // de onde a ferramenta sai, relativo aos pés
      inheritVelocity: 0.35,          // fração da velocidade do Kanka somada ao arremesso
      // Ângulo em graus acima da horizontal + velocidade inicial (px/s)
      aim: {
        normal: { angle: 32, speed: 265 },
        up: { angle: 64, speed: 310 },     // segurando ↑: arco alto
        down: { angle: -12, speed: 270 },  // segurando ↓ no ar: tiro rasante para baixo
      },
      // Sequência de ferramentas arremessadas (gira em ciclo). gravityScale muda o peso.
      tools: [
        { sprite: 'projeteis/chave_de_boca', damage: 3, gravityScale: 1.15, spin: 14, speedScale: 0.95 },
        { sprite: 'projeteis/parafuso', damage: 2, gravityScale: 1.0, spin: 20, speedScale: 1 },
        { sprite: 'projeteis/porca', damage: 2, gravityScale: 1.0, spin: 18, speedScale: 1 },
        { sprite: 'projeteis/arruela', damage: 1, gravityScale: 0.75, spin: 26, speedScale: 1.12 },
      ],
      hitSize: 10,
      bounces: 1,          // quica uma vez no chão antes de sumir
      restitution: 0.38,   // quanto da velocidade vertical sobra no quique
      friction: 0.6,       // quanto da velocidade horizontal sobra no quique
      lifeAfterBounce: 0.5,
      knockback: 70,
      hitstop: 0.025,
    },
  },

  paulinho: {
    id: 'paulinho',
    name: 'PAULINHO',
    style: 'ARMAS PESADAS',
    weapon: 'CHAVE DE ENGENHEIRO',
    sprites: 'personagens/paulinho/',
    portrait: 'ui/retrato_paulinho',
    hudPortrait: 'hud/retrato_paulinho',
    weaponIcon: 'ui/icone_chave_engenheiro',
    stats: { vida: 5, forca: 5, velocidade: 2, alcance: 3 },
    maxHp: 28,
    body: { w: 18, h: 34 },
    move: {
      maxSpeed: 100, accel: 900, decel: 1150, turnAccel: 1900, airAccel: 650, airDecel: 350,
      jumpHeight: 50, timeToApex: 0.34, fallMultiplier: 1.7, jumpCut: 0.5, maxFall: 440,
      coyoteTime: 0.1, jumpBuffer: 0.12,
    },
    // Paulinho é pesado: aterrissagem treme a tela de leve e ele resiste a empurrões.
    heavy: { landShake: 1.2, knockbackResist: 0.5 },
    attacks: {
      ground: {
        anim: 'ataque', moveFactor: 0.0, damage: 4, hitInterval: 99, knockback: 230, hitstop: 0.09,
        sound: 'chave_giro', hitSound: 'chave_impacto', hitEffect: 'spark', cooldown: 0.15,
        impactFrame: 4, impactShake: 3.5, // quadro em que a chave bate no chão
        active: {
          // Vários retângulos no mesmo quadro: a chave + a onda rente ao chão.
          4: [{ x: 4, y: -46, w: 34, h: 46 }, { x: 4, y: -12, w: 52, h: 12 }],
          5: { x: 8, y: -24, w: 30, h: 24 },
        },
      },
      air: {
        anim: 'ataque_ar', moveFactor: 0.8, damage: 3, hitInterval: 99, knockback: 180, hitstop: 0.07,
        sound: 'chave_giro', hitSound: 'chave_impacto', hitEffect: 'spark', cooldown: 0.15,
        active: {
          2: { x: 2, y: -46, w: 32, h: 36 },
          3: { x: 6, y: -32, w: 30, h: 32 },
        },
      },
    },
  },
};

/** Ordem na tela de seleção. */
export const CHARACTER_ORDER = ['samurai_jeff', 'kanka', 'paulinho'];
