// Kitchen Sink App · Block · Dashboard Block
//
// A block is a plugin-provided dashlet an admin drops onto a Dashboard, Homepage, Chart
// Group, or a record page. Which surfaces offer a given
// block is the `types` array in config.json — this one is `["dashboards"]`, so it only appears
// in the Dashboard block picker.
//
// The runtime is the same worker-rendered-DOM model as views and floating frames: script.js
// runs when the block mounts and paints markup with `this.outputUI(...)`. There is no DOM API in
// the worker, so interactivity is wired through `data-script="<name>"` attributes, each
// dispatched to the matching file under `eventScripts/`. An event script may itself call
// `this.outputUI(...)` to repaint the block in place (see eventScripts/refresh.js). Each run
// executes in its OWN fresh worker with a new context, so
// nothing stored on `this` carries across runs. What persists is the painted DOM (the last
// outputUI markup stays on screen) and any state you temporarily store through `this.sessionData` /
// `this.setSessionData`.
//
// Sizing (min_w/max_w/min_h/max_h in grid columns, recommended_height in px) is declared in
// config.json and enforced by the host grid; the script never positions itself. This block also
// carries `when: Boolean({{config.enableBlocks}})`, so turning the "Enable Blocks" setup-assistant
// toggle off removes it from the picker.

this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge">DASHBOARD</span>
      <span class="ks-block__title">Dashboard Block</span>
    </div>
    <p class="ks-block__desc">
      Rendered by <code>outputUI</code> and styled by <code>styles.css</code>. The buttons below
      dispatch to files under <code>eventScripts/</code>.
    </p>
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="simulateLoading">Simulate loading</button>
      <button class="ks-block__btn" data-script="refresh">Refresh in place</button>
      <button class="ks-block__btn" data-script="chain">Chain → logContext</button>
      <button class="ks-block__btn" data-script="logContext">Log context</button>
    </div>
  </div>
`);
