import { state } from "./state.js";

export function laneExists(lane) {
  return state.party.some(p => p.assignedLane === lane);
}

export function hasSpace() {
  return state.party.length < 4;
}

export function assignLane(player) {
  return player.lanes.find(lane => !laneExists(lane));
}

export function addToParty(player) {
  player.assignedLane = assignLane(player) || player.lanes[0];
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
  if (player) player.lives++;
}

export function decrementAllLives() {
  const mortos = [];

  state.party.forEach(p => {
    p.lives--;
    if (p.lives <= 0) mortos.push(p.id);
  });

  return mortos;
}