export function createRoundBlocks(rootEl) {
  rootEl.innerHTML = `<div class="round-blocks" data-role="blocks"></div>`;
  const blocksEl = rootEl.querySelector('[data-role="blocks"]');

  function render(rounds, completedCount) {
    const safeRounds = Math.max(1, Number(rounds) || 1);
    const safeCompleted = Math.max(0, Math.min(safeRounds, Number(completedCount) || 0));
    blocksEl.innerHTML = "";
    blocksEl.dataset.density = safeRounds > 24 ? "dense" : safeRounds > 12 ? "compact" : "regular";
    blocksEl.setAttribute("aria-label", `Rounds completed ${safeCompleted} of ${safeRounds}`);

    for (let i = 0; i < safeRounds; i += 1) {
      const block = document.createElement("span");
      block.className = `round-block ${i < safeCompleted ? "round-block-done" : "round-block-open"}`;
      blocksEl.appendChild(block);
    }
  }

  return { render };
}
