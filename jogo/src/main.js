// Ponto de entrada: cria os sistemas e começa pela tela de carregamento.

import { Renderer } from './core/Renderer.js';
import { Input } from './core/Input.js';
import { AudioManager } from './core/AudioManager.js';
import { Assets } from './core/Assets.js';
import { BitmapFont } from './core/BitmapFont.js';
import { Game } from './core/Game.js';
import { BootScene } from './scenes/BootScene.js';
import { VIEW_W, VIEW_H } from './config/constants.js';

async function main() {
  const canvas = document.getElementById('tela');
  const renderer = new Renderer(canvas);
  const input = new Input();
  input.attachPointer(canvas, VIEW_W, VIEW_H);
  const audio = new AudioManager();
  const assets = new Assets(audio);

  // Áudio só pode tocar depois de uma interação do jogador.
  input.onFirstInteraction(() => audio.unlock());

  // 1) Carrega o mínimo para desenhar a tela de carregamento (fonte + barra).
  await assets.loadManifest();
  await assets.load({ bootOnly: true });
  const font = new BitmapFont(assets);

  const game = new Game({ renderer, input, audio, assets, font });
  // 2) A BootScene carrega o resto mostrando o progresso.
  game.start(new BootScene(game));
  window.jogo = game; // acesso pelo console para depuração
}

main().catch((err) => {
  console.error(err);
  document.body.style.color = '#fff';
  document.body.style.font = '14px monospace';
  document.body.textContent = `Erro ao iniciar o jogo: ${err.message}. ` +
    'Rode por um servidor local (veja jogo/README.md), não abrindo o arquivo direto.';
});
