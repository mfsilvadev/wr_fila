import { state } from "./state.js";
import { load, save } from "./storage.js";
import { addToQueue, tryFillParty, removeFromQueue } from "./queue.js";
import { addToParty, removeFromParty, laneExists, hasSpace, decrementLife, incrementLife, decrementAllLives } from "./party.js";
import { render } from "./ui.js";
import { loadRanking, addLoss } from "./ranking.js";

//cria player
function createPlayer(name, lanes, lives) {
  return {
    id: Date.now(),
    name,
    lanes,
    lives
  };
}

//lanes selecionadas
function getSelectedLanes() {
  const checkboxes = document.querySelectorAll("#laneSelect input:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}

//adicionar manual
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

//remover
function removePlayer(id) {
  removeFromParty(id);
  tryFillParty();
  update();
}

//perdeu
function loseLife(id) {
  const player = state.party.find(p => p.id === id);
  const morreu = decrementLife(id);

  if (morreu && player) {
    addLoss(player.name, player.assignedLane);

    removeFromParty(id);

    state.eliminated.push({
      name: player.name
    });

    tryFillParty();
  }

  update();
}

//continua
function addLife(id) {
  incrementLife(id);
  update();
}

//todos perdem
function loseAllLives() {
  const mortos = decrementAllLives();

  mortos.forEach(id => {
    const player = state.party.find(p => p.id === id);
    if (player) addLoss(player.name, player.assignedLane);

    state.eliminated.push({ name: player.name });
  });

  mortos.forEach(id => removeFromParty(id));

  tryFillParty();
  update();
}

//histórico
function addFromHistory(name, lane) {
  const player = createPlayer(name, [lane], 1);

  if (hasSpace() && !laneExists(lane)) {
    addToParty(player);
  } else {
    addToQueue(player);
  }

  update();
}

//voltar dos eliminados
function addFromEliminated(name, lane, index) {
  const player = createPlayer(name, [lane], 1);

  if (hasSpace() && !laneExists(lane)) {
    addToParty(player);
  } else {
    addToQueue(player);
  }

  state.eliminated.splice(index, 1);

  update();
}

//drag
function moveToParty(id) {
  const player = state.queue.find(p => p.id === id);
  if (!player) return;

  removeFromQueue(id);
  addToParty(player);

  update();
}

function moveToQueue(id) {
  const player = state.party.find(p => p.id === id);
  if (!player) return;

  removeFromParty(id);
  addToQueue(player);

  update();
}

function resetAll() {
  if (!confirm("Tem certeza que quer apagar tudo?")) return;

  localStorage.clear();

  location.reload();
}

//update
function update() {
  save();
  render({
    remove: removePlayer,
    loseLife,
    addLife,
    addFromHistory,
    moveToParty,
    moveToQueue,
    addFromEliminated
  });
}

//INIT
//INIT
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
    moveToQueue,
    addFromEliminated
  });

  const addBtn = document.getElementById("addBtn");
  if (addBtn) addBtn.onclick = addPlayer;

  const loseAllBtn = document.getElementById("loseAllBtn");
  if (loseAllBtn) loseAllBtn.onclick = loseAllLives;

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.onclick = resetAll;

  document.getElementById("searchQueue")?.addEventListener("input", update);

  let lastState = "";

    setInterval(() => {
    const current = localStorage.getItem("wrState");

    if (current !== lastState) {
        lastState = current;

        load();
        tryFillParty();
        update();
    }
    }, 300000);

  window.addEventListener("storage", (event) => {
    if (event.key === "wrState") {
      load();
      tryFillParty();
      update();
    }
  });

// ⚙️ CONFIG MODAL
const configBtn = document.getElementById("configBtn");
const modal = document.getElementById("configModal");

const hostLaneInput = document.getElementById("configHostLane");
const maxEntriesInput = document.getElementById("configMaxEntries");

const saveBtn = document.getElementById("saveConfig");
const closeBtn = document.getElementById("closeConfig");

// abrir
if (configBtn) {
  configBtn.onclick = () => {
    modal.classList.remove("hidden");

    hostLaneInput.value = state.config.hostLane || "";
    maxEntriesInput.value = state.config.maxEntries;
  };
}

// fechar
if (closeBtn) {
  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

// salvar
if (saveBtn) {
  saveBtn.onclick = () => {
    state.config.hostLane = hostLaneInput.value || null;
    state.config.maxEntries = parseInt(maxEntriesInput.value);

    save();
    update();

    modal.classList.add("hidden");
  };
}
});