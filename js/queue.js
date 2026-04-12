import { state } from "./state.js";
import { laneExists, addToParty, hasSpace } from "./party.js";

function canFitPlayer(player) {
  return player.lanes.some(lane => !laneExists(lane));
}

export function addToQueue(player) {
  state.queue.push(player);
}

export function removeFromQueue(id) {
  state.queue = state.queue.filter(p => p.id !== id);
}

export function tryFillParty() {
  for (let i = 0; i < state.queue.length; i++) {
    const p = state.queue[i];

    if (hasSpace() && canFitPlayer(p)) {
      addToParty(p);
      state.queue.splice(i, 1);
      i--;
    }
  }
}