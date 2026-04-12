import { state } from "./state.js";
import { load, save } from "./storage.js";
import { addToQueue, tryFillParty, removeFromQueue } from "./queue.js";
import { addToParty, removeFromParty, laneExists, hasSpace, decrementLife, incrementLife, decrementAllLives } from "./party.js";
import { render } from "./ui.js";
import { loadRanking, addLoss } from "./ranking.js";

// 🔧 cria player
function createPlayer(name, lanes, lives) {
  return {
    id: Date.now(),
    name,
    lanes,
    lives
  };
}

// 🧠 pega lanes selecionadas
function getSelectedLanes() {
  const checkboxes = document.querySelectorAll("#laneSelect input:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}

// ➕ adicionar player manual
function addPlayer() {
  const nameInput = document.getElementById("name");

  const name = nameInput.value;
  const lanes = getSelectedLanes();
  const lives = parseInt(document.getElementById("lives").value);

  if (!name || lanes.length === 0) return;

  const player = createPlayer(name, lanes, lives);

  if (hasSpace() && lanes.some(l => !laneExists(l))) {
    addToParty(player);
  } else {
    addToQueue(player);
  }

  nameInput.value = "";
  document.querySelectorAll("#laneSelect input").forEach(cb => cb.checked = false);

  update();
}

// ❌ remover
function removePlayer(id) {
  removeFromParty(id);
  tryFillParty();
  update();
}

// 💔 perdeu
function loseLife(id) {
  const player = state.party.find(p => p.id === id);
  const morreu = decrementLife(id);

  if (morreu && player) {
    addLoss(player.name);
    removeFromParty(id);
    tryFillParty();
  }

  update();
}

// 🔁 continua
function addLife(id) {
  incrementLife(id);
  update();
}

// 💥 todos perdem
function loseAllLives() {
  const mortos = decrementAllLives();

  mortos.forEach(id => {
    const player = state.party.find(p => p.id === id);
    if (player) addLoss(player.name);
  });

  mortos.forEach(id => removeFromParty(id));

  tryFillParty();
  update();
}

// ➕ histórico
function addFromHistory(name) {
  const lanes = getSelectedLanes();
  if (lanes.length === 0) return;

  const player = createPlayer(name, lanes, 1);

  if (hasSpace() && lanes.some(l => !laneExists(l))) {
    addToParty(player);
  } else {
    addToQueue(player);
  }

  update();
}

// 🖱️ drag → party
function moveToParty(id) {
  const player = state.queue.find(p => p.id === id);
  if (!player) return;

  removeFromQueue(id);
  addToParty(player);

  update();
}

// 🖱️ drag → fila
function moveToQueue(id) {
  const player = state.party.find(p => p.id === id);
  if (!player) return;

  removeFromParty(id);
  addToQueue(player);

  update();
}

// 🔄 update
function update() {
  save();
  render({
    remove: removePlayer,
    loseLife,
    addLife,
    addFromHistory,
    moveToParty,
    moveToQueue
  });
}

// 🚀 INIT
window.addEventListener("DOMContentLoaded", () => {
  load();
  loadRanking();
  tryFillParty();

  render({
    remove: removePlayer,
    loseLife,
    addLife,
    addFromHistory,
    moveToParty,
    moveToQueue
  });

  document.getElementById("addBtn").onclick = addPlayer;
  document.getElementById("loseAllBtn").onclick = loseAllLives;
  document.getElementById("searchPlayer")?.addEventListener("input", update);
});