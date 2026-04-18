import { state } from "./state.js";
import { laneExists } from "./party.js";
import { getAllPlayers, getPlayerLane } from "./ranking.js";

// 🎮 SVGs
const laneIcons = {
  top: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 20L20 4H14L4 14V20Z"/></svg>`,
  jg: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8 6 6 10 6 14A6 6 0 0018 14C18 10 16 6 12 2Z"/></svg>`,
  mid: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 12L12 3L21 12L12 21Z"/></svg>`,
  adc: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 12L22 2L12 22L10 14Z"/></svg>`,
  sup: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2L15 8H21L16 12L18 18L12 14L6 18L8 12L3 8H9Z"/></svg>`
};

// 🧠 render de lanes
function renderLaneIcons(lanes, assignedLane = null) {
  return lanes.map(lane => {
    const isMain = lane === assignedLane;

    return `
      <span class="lane-icon ${isMain ? "main" : ""} lane-${lane}">
        ${laneIcons[lane]}
      </span>
    `;
  }).join("");
}

export function render(handlers) {
  const { remove, loseLife, addLife, addFromHistory, moveToParty, moveToQueue } = handlers;

  const partyDiv = document.getElementById("party");
  const queueDiv = document.getElementById("queue");
  const historyDiv = document.getElementById("history");
  const searchInput = document.getElementById("searchPlayer");

  partyDiv.innerHTML = "";
  queueDiv.innerHTML = "";
  if (historyDiv) historyDiv.innerHTML = "";

  // 🎮 PARTY
  state.party.forEach(p => {
    const el = document.createElement("div");
    el.className = `card ${p.assignedLane}`;
    el.draggable = true;

    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("playerId", p.id);
      e.dataTransfer.setData("source", "party");
    });

    el.innerHTML = `
      <span>
        ${p.name}
        ${renderLaneIcons(p.lanes, p.assignedLane)}
        ❤️${p.lives}
      </span>
      <div>
        <button class="lose">💔</button>
        <button class="continue">🔁</button>
        <button class="remove">X</button>
      </div>
    `;

    el.querySelector(".remove").onclick = () => remove(p.id);
    el.querySelector(".lose").onclick = () => loseLife(p.id);
    el.querySelector(".continue").onclick = () => addLife(p.id);

    partyDiv.appendChild(el);
  });

  // ⏳ FILA
  const laneCounters = {};

  state.queue.forEach(p => {
    const el = document.createElement("div");
    el.className = "card";
    el.draggable = true;

    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("playerId", p.id);
      e.dataTransfer.setData("source", "queue");
    });

    const lanes = p.lanes || [p.lane];
    const lives = p.lives ?? 1;

    const mainLane = lanes[0];

    if (!laneCounters[mainLane]) laneCounters[mainLane] = 0;
    laneCounters[mainLane]++;

    const position = laneCounters[mainLane];

    el.innerHTML = `
      <span>
        <span class="lane-priority lane-${mainLane}">
          ${mainLane.toUpperCase()} #${position}
        </span>
        ${p.name}
        ${renderLaneIcons(lanes)}
        ❤️${lives}
      </span>
    `;

    queueDiv.appendChild(el);
  });

  // 🧲 DROP
  partyDiv.addEventListener("dragover", e => e.preventDefault());
  queueDiv.addEventListener("dragover", e => e.preventDefault());

  partyDiv.addEventListener("drop", e => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("playerId"));
    const source = e.dataTransfer.getData("source");

    if (source === "queue") moveToParty(id);
  });

  queueDiv.addEventListener("drop", e => {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("playerId"));
    const source = e.dataTransfer.getData("source");

    if (source === "party") moveToQueue(id);
  });

  // 🔎 HISTÓRICO COM LANE SALVA
  if (historyDiv && searchInput) {
    const search = searchInput.value.toLowerCase();

    getAllPlayers()
      .filter(name => name.toLowerCase().includes(search))
      .forEach(name => {
        const savedLane = getPlayerLane(name);

        const el = document.createElement("div");
        el.className = "card";

        el.innerHTML = `
          <span>${name}</span>

          <select class="lane-select">
            <option value="top" ${savedLane === "top" ? "selected" : ""}>Top</option>
            <option value="jg" ${savedLane === "jg" ? "selected" : ""}>Jungle</option>
            <option value="mid" ${savedLane === "mid" ? "selected" : ""}>Mid</option>
            <option value="adc" ${savedLane === "adc" ? "selected" : ""}>ADC</option>
            <option value="sup" ${savedLane === "sup" ? "selected" : ""}>Support</option>
          </select>

          <button class="add">➕</button>
        `;

        const select = el.querySelector(".lane-select");

        el.querySelector(".add").onclick = () => {
          addFromHistory(name, select.value);
        };

        historyDiv.appendChild(el);
      });
  }
}
