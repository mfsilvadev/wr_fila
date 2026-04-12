import { state } from "./state.js";
import { laneExists } from "./party.js";
import { getAllPlayers } from "./ranking.js";

export function render(handlers) {
  const { remove, loseLife, addLife, addFromHistory, moveToParty, moveToQueue } = handlers;

  const partyDiv = document.getElementById("party");
  const queueDiv = document.getElementById("queue");
  const historyDiv = document.getElementById("history");
  const searchInput = document.getElementById("searchPlayer");

  partyDiv.innerHTML = "";
  queueDiv.innerHTML = "";
  if (historyDiv) historyDiv.innerHTML = "";

  // =====================
  // 🎮 PARTY
  // =====================
  state.party.forEach(p => {
    const el = document.createElement("div");
    el.className = `card ${p.assignedLane} fade-in`;
    el.draggable = true;

    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("playerId", p.id);
      e.dataTransfer.setData("source", "party");

      partyDiv.classList.add("dragging-from-party");
      queueDiv.classList.add("drop-target");
    });

    el.addEventListener("dragend", () => {
      partyDiv.classList.remove("dragging-from-party");
      queueDiv.classList.remove("drop-target");
    });

    el.innerHTML = `
      <span>${p.name} (${p.assignedLane}) ❤️${p.lives}</span>
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

  // =====================
  // ⏳ FILA
  // =====================
  state.queue.forEach(p => {
    const el = document.createElement("div");
    el.className = "card fade-in";
    el.draggable = true;

    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("playerId", p.id);
      e.dataTransfer.setData("source", "queue");

      queueDiv.classList.add("dragging-from-queue");
      partyDiv.classList.add("drop-target");
    });

    el.addEventListener("dragend", () => {
      queueDiv.classList.remove("dragging-from-queue");
      partyDiv.classList.remove("drop-target");
    });

    const lanes = p.lanes || [p.lane];

    el.innerHTML = `
      <span>${p.name} (${lanes.join(" / ")}) ❤️${p.lives}</span>
    `;

    queueDiv.appendChild(el);
  });

  // =====================
  // 🧲 DROP AREAS
  // =====================
  partyDiv.addEventListener("dragover", e => e.preventDefault());
  queueDiv.addEventListener("dragover", e => e.preventDefault());

  partyDiv.addEventListener("drop", e => {
    e.preventDefault();

    const id = Number(e.dataTransfer.getData("playerId"));
    const source = e.dataTransfer.getData("source");

    if (source === "queue") {
      moveToParty(id);
    }
  });

  queueDiv.addEventListener("drop", e => {
    e.preventDefault();

    const id = Number(e.dataTransfer.getData("playerId"));
    const source = e.dataTransfer.getData("source");

    if (source === "party") {
      moveToQueue(id);
    }
  });

  // =====================
  // 🔎 HISTÓRICO
  // =====================
  if (historyDiv && searchInput) {
    const search = searchInput.value.toLowerCase();

    getAllPlayers()
      .filter(name => name.toLowerCase().includes(search))
      .forEach(name => {
        const el = document.createElement("div");
        el.className = "card fade-in";

        el.innerHTML = `
          <span>${name}</span>
          <button class="add">➕</button>
        `;

        el.querySelector(".add").onclick = () => addFromHistory(name);

        historyDiv.appendChild(el);
      });
  }
}