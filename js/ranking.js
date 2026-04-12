const KEY = "wrRanking";

let ranking = {};

export function loadRanking() {
  const data = localStorage.getItem(KEY);
  if (data) ranking = JSON.parse(data);
}

export function saveRanking() {
  localStorage.setItem(KEY, JSON.stringify(ranking));
}

function ensurePlayer(name, lanes = []) {
  if (!ranking[name]) {
    ranking[name] = { wins: 0, losses: 0, lanes };
  } else if (!ranking[name].lanes?.length && lanes.length) {
    ranking[name].lanes = lanes;
  }
}

export function addLoss(name, lanes = []) {
  ensurePlayer(name, lanes);
  ranking[name].losses++;
  saveRanking();
}

export function addWin(name, lanes = []) {
  ensurePlayer(name, lanes);
  ranking[name].wins++;
  saveRanking();
}

export function getAllPlayers() {
  return Object.keys(ranking);
}