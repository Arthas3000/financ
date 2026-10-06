// Recorde salvo no navegador (opcional: se o armazenamento estiver bloqueado, só não salva).

const KEY = 'furia-na-floresta:recorde';

export function loadHighScore() {
  try { return parseInt(localStorage.getItem(KEY), 10) || 0; } catch { return 0; }
}

export function saveHighScore(score) {
  try {
    if (score > loadHighScore()) localStorage.setItem(KEY, String(score));
  } catch { /* armazenamento indisponível */ }
}
