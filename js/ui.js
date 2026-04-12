import { state } from "./state.js";
import { laneExists } from "./party.js";
import { getAllPlayers } from "./ranking.js";

export function render(handlers) {
  const { remove, loseLife, addLife, addFromHistory, moveToParty, moveToQueue, addFromEliminated } = handlers;

  const partyDiv = document.getElementById("party");
  const queueDiv = document.getElementById("queue");
  const historyDiv = document.getElementById("history");
  const searchInput = document.getElementById("searchPlayer");
  const eliminatedDiv = document.getElementById("eliminated");

  partyDiv.innerHTML = "";
  queueDiv.innerHTML = "";
  if (historyDiv) historyDiv.innerHTML = "";
  if (eliminatedDiv) eliminatedDiv.innerHTML = "";

//PARTY
  state.party.forEach(p => {
    const el = document.createElement("div");
    el.className = `card ${p.assignedLane}`;
    el.draggable = true;

    el.addEventListener("dragstart", e => {
      e.dataTransfer.setData("playerId", p.id);
      e.dataTransfer.setData("source", "party");
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

//FILA
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

  if (!laneCounters[mainLane]) {
    laneCounters[mainLane] = 0;
  }

  laneCounters[mainLane]++;
  const position = laneCounters[mainLane];

  el.innerHTML = `
    <span>
      <span class="lane-priority lane-${mainLane}">
        ${mainLane.toUpperCase()} #${position}
      </span>
      ${p.name} ❤️${lives}
    </span>
  `;

  queueDiv.appendChild(el); 
});

//DROP
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

//HISTÓRICO
  if (historyDiv && searchInput) {
    const search = searchInput.value.toLowerCase();

    getAllPlayers()
      .filter(name => name.toLowerCase().includes(search))
      .forEach(name => {
        const el = document.createElement("div");
        el.className = "card";

        el.innerHTML = `
          <span>${name}</span>
          <button class="add">➕</button>
        `;

        el.querySelector(".add").onclick = () => addFromHistory(name);

        historyDiv.appendChild(el);
      });
  }

//ELIMINADOS
if (historyDiv && searchInput) {
  const search = searchInput.value.toLowerCase();

  getAllPlayers()
    .filter(name => name.toLowerCase().includes(search))
    .forEach(name => {
      const el = document.createElement("div");
      el.className = "card";

      el.innerHTML = `
        <span>${name}</span>

        <select class="lane-select">
          <option value="top">Top</option>
          <option value="jg">Jungle</option>
          <option value="mid">Mid</option>
          <option value="adc">ADC</option>
          <option value="sup">Support</option>
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