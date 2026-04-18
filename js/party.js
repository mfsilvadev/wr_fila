import { state } from "./state.js";

export function hasSpace() {
  return state.party.length < 4;
}

export function laneExists(lane) {
  const laneInParty = state.party.some(p => p.assignedLane === lane);

  // 👇 bloqueia lane do host
  const isHostLane = state.config.hostLane === lane;

  return laneInParty || isHostLane;
}

export function assignLane(player) {
  const lanes = player.lanes || [player.lane];

  return lanes.find(lane => !laneExists(lane));
}

export function addToParty(player) {
  const lane = assignLane(player);
  if (!lane) return;

  player.assignedLane = lane;
  state.party.push(player);
}

export function removeFromParty(id) {
  state.party = state.party.filter(p => p.id !== id);
}

export function decrementLife(id) {
  const player = state.party.find(p => p.id === id);
  if (!player) return false;

  player.lives--;
  return player.lives <= 0;
}

export function incrementLife(id) {
  const player = state.party.find(p => p.id === id);
  if (!player) return;

  player.lives++;
}

export function decrementAllLives() {
  const mortos = [];

  state.party.forEach(p => {
    p.lives--;
    if (p.lives <= 0) mortos.push(p.id);
  });

  return mortos;
}