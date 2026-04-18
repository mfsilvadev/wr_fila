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
    ranking[name] = {
      wins: 0,
      losses: 0,
      lastLane: null,
      entries: 0 // 👈 controle de entradas
    };
  }
}

export function addLoss(name, lane = null) {
  ensurePlayer(name);

  ranking[name].losses++;

  if (lane) ranking[name].lastLane = lane;

  saveRanking();
}

export function addWin(name, lane = null) {
  ensurePlayer(name);

  ranking[name].wins++;

  if (lane) ranking[name].lastLane = lane;

  saveRanking();
}

// 👇 limite
export function canEnter(name, max) {
  const player = ranking[name];
  if (!player) return true;

  return (player.entries || 0) < max;
}

export function addEntry(name) {
  ensurePlayer(name);

  ranking[name].entries = (ranking[name].entries || 0) + 1;
  saveRanking();
}

export function getPlayerLane(name) {
  return ranking[name]?.lastLane || null;
}

export function getAllPlayers() {
  return Object.keys(ranking);
}