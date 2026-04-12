import { state } from "./state.js";

const KEY = "wrQueue";

export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function load() {
  const data = localStorage.getItem(KEY);
  if (data) {
    const parsed = JSON.parse(data);
    state.party = parsed.party || [];
    state.queue = parsed.queue || [];
  }
}