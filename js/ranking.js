const KEY = "wrRanking";

let ranking = {};

export function loadRanking() {
  const data = localStorage.getItem(KEY);
  if (data) ranking = JSON.parse(data);
}

export function saveRanking() {
  localStorage.setItem(KEY, JSON.stringify(ranking));
}

function ensurePlayer(name) {
  if (!ranking[name]) {
    ranking[name] = { wins: 0, losses: 0 };
  }
}

export function addWin(name) {
  ensurePlayer(name);
  ranking[name].wins++;
  saveRanking();
}

export function addLoss(name) {
  ensurePlayer(name);
  ranking[name].losses++;
  saveRanking();
}

export function getAllPlayers() {
  return Object.keys(ranking);
}