// Kitchen Sink App · Block · Dashboard Block · refresh
//
// An event script can repaint the block by calling `outputUI` again. This swaps the rendered
// markup in place, even though each event-script run is its own fresh worker
// (no worker state is retained between runs; the repaint is driven purely by this outputUI call).
// The re-rendered markup keeps its own data-script buttons, so it can be triggered repeatedly.

this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge ks-block__badge--accent">REFRESHED</span>
      <span class="ks-block__title">Dashboard Block</span>
    </div>
    <p class="ks-block__desc">Repainted from an event script via <code>outputUI</code>.</p>
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="simulateLoading">Simulate loading</button>
      <button class="ks-block__btn" data-script="refresh">Refresh again</button>
      <button class="ks-block__btn" data-script="chain">Chain → logContext</button>
      <button class="ks-block__btn" data-script="logContext">Log context</button>
    </div>
  </div>
`);
