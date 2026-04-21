import { state } from "./state.js";
import { laneExists } from "./party.js";
import { getAllPlayers, getPlayerLane } from "./ranking.js";

// 🎮 Ícones melhores (Lucide)
const laneIcons = {
  top: `<i data-lucide="arrow-up"></i>`,
  jg: `<i data-lucide="tree-pine"></i>`,
  mid: `<i data-lucide="diamond"></i>`,
  adc: `<i data-lucide="crosshair"></i>`,
  sup: `<i data-lucide="shield"></i>`
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
  const queueSearchInput = document.getElementById("searchQueue");
  const queueSearch = queueSearchInput?.value?.toLowerCase() || "";

  partyDiv.innerHTML = "";
  queueDiv.innerHTML = "";
  if (historyDiv) historyDiv.innerHTML = "";

  // 🎮 PARTY COM SLOTS
  const maxPartySize = 4;

  for (let i = 0; i < maxPartySize; i++) {
    const p = state.party[i];
    const el = document.createElement("div");

    if (p) {
      el.className = `card ${p.assignedLane}`;
      el.draggable = true;

      el.addEventListener("dragstart", e => {
        e.dataTransfer.setData("playerId", p.id);
        e.dataTransfer.setData("source", "party");
      });

      el.innerHTML = `
        <span>
          ${p.name}

          <select class="lane-edit">
            ${p.lanes.map(lane => `
              <option value="${lane}" ${lane === p.assignedLane ? "selected" : ""}>
                ${lane.toUpperCase()}
              </option>
            `).join("")}
          </select>

          <span class="lives">
            <i data-lucide="heart"></i> ${p.lives}
          </span>
        </span>

        <div>
          <button class="icon-btn lose" title="Remover vida">
            <i data-lucide="heart-off"></i>
          </button>

          <button class="icon-btn continue" title="Adicionar vida">
            <i data-lucide="heart"></i>
          </button>

          <button class="icon-btn remove" title="Remover jogador">
            <i data-lucide="x"></i>
          </button>
        </div>
      `;

      el.querySelector(".remove").onclick = () => remove(p.id);
      el.querySelector(".lose").onclick = () => loseLife(p.id);
      el.querySelector(".continue").onclick = () => addLife(p.id);
      el.querySelector(".lane-edit").onchange = (e) => {handlers.changeLane(p.id, e.target.value);};

    } else {
      el.className = "card empty";

      el.innerHTML = `
        <span>+ Vaga disponível</span>
      `;
    }

    partyDiv.appendChild(el);
  }

  // ⏳ FILA
  const laneCounters = {};

  state.queue.filter(p => p.name.toLowerCase().includes(queueSearch)).forEach(p => {
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

        <span class="lives">
          <i data-lucide="heart"></i> ${lives}
        </span>
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

  // 🔎 HISTÓRICO
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

          <button class="icon-btn add" title="Adicionar jogador">
            <i data-lucide="plus"></i>
          </button>
        `;

        const select = el.querySelector(".lane-select");

        el.querySelector(".add").onclick = () => {
          addFromHistory(name, select.value);
        };

        historyDiv.appendChild(el);
      });
  }

  // 🎨 renderiza ícones
  if (window.lucide) {
    window.lucide.createIcons();
  }
}