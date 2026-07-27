// Kitchen Sink App · Block · Chart Group Block
//
// `types: ["charts"]` scopes this block to the Chart Group picker. It has no `when`, so it is
// always offered - compare this to the Dashboard and Homepage blocks, which the "Enable Blocks" toggle
// can hide them. It reads its install config directly (`this.config.contextValue`, set in the setup
// assistant) and interpolates it into the rendered markup.

this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge">CHART GROUP</span>
      <span class="ks-block__title">Chart Group Block</span>
    </div>
    <p class="ks-block__desc">
      Install config value <code>contextValue</code> is
      <strong>${this.config.contextValue}</strong>.
    </p>
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="logContext">Log context</button>
    </div>
  </div>
`);
