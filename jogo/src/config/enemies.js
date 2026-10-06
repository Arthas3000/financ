// Definição dos inimigos. Hitboxes seguem a mesma convenção de characters.js
// (relativas aos pés, olhando para a direita).

export const ENEMIES = {
  // Fase 1 — mecânico briguento que corre atrás de você e bate com a ferramenta.
  logmax: {
    id: 'logmax',
    sprites: 'inimigos/logmax/',
    body: { w: 16, h: 34 },
    hp: 6,
    score: 100,
    contactDamage: 3,
    patrolSpeed: 35,
    chaseSpeed: 82,
    accel: 600,
    sight: { range: 150, height: 56 },   // distância em que ele te vê
    giveUpRange: 260,                    // longe disso, volta a patrulhar
    attack: {
      range: 36,          // começa o golpe quando você está a essa distância
      cooldown: 0.9,
      damage: 5,
      knockback: 160,
      lungeFrame: 2,      // dá um passo à frente neste quadro
      lungeSpeed: 70,
      sound: 'inimigo_golpe',
      active: {
        2: { x: 2, y: -40, w: 28, h: 36 },
        3: { x: 4, y: -26, w: 26, h: 24 },
      },
    },
  },

  // Fase 2 — mecânico que mantém distância e arremessa latas de óleo em arco.
  ponssee: {
    id: 'ponssee',
    sprites: 'inimigos/ponssee/',
    body: { w: 16, h: 34 },
    hp: 8,
    score: 150,
    contactDamage: 3,
    patrolSpeed: 30,
    retreatSpeed: 50,
    accel: 500,
    sight: { range: 230, height: 90 },
    giveUpRange: 320,
    preferredDistance: 110, // tenta ficar a esta distância
    tooClose: 64,           // mais perto que isso, recua
    throw: {
      cooldown: 1.7,
      frame: 2,
      handOffset: { x: 8, y: -32 },
      flightTime: 0.85,     // a lata é mirada para cair onde você está depois desse tempo
      gravity: 900,
      damage: 4,
      knockback: 120,
      sprite: 'projeteis/lata_oleo',
      sound: 'lata_arremesso',
    },
  },
};
