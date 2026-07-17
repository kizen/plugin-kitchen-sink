// Kitchen Sink App · Block · Dashboard Block · simulateLoading
//
// setIndicator + wait together. setIndicator shows a loading affordance on the block ("none",
// "block", "button", "spinner"); The engine
// resets the indicator to "none" on cleanup, so there's nothing to turn off.

// Show a spinner over the block while we "work".
this.setIndicator("spinner");

// Pause so the spinner is visible (always await wait).
await this.wait(2000);

// Repaint; on return, cleanup clears the indicator.
this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge ks-block__badge--accent">DONE</span>
      <span class="ks-block__title">Dashboard Block</span>
    </div>
    <p class="ks-block__desc">
      Showed a <code>spinner</code> indicator for two seconds via <code>setIndicator</code> +
      <code>wait</code>, then repainted. The indicator cleared itself on cleanup.
    </p>
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="simulateLoading">Simulate loading</button>
      <button class="ks-block__btn" data-script="refresh">Refresh in place</button>
      <button class="ks-block__btn" data-script="chain">Chain → logContext</button>
      <button class="ks-block__btn" data-script="logContext">Log context</button>
    </div>
  </div>
`);
