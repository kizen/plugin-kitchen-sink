// Kitchen Sink App · Block · Record Block
//
// `types: ["records"]` targets the record-detail block surface, one of the four declared block
// types (homepages · dashboards · charts · records). It packages like any other block.

this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge">RECORD</span>
      <span class="ks-block__title">Record Block</span>
    </div>
    <p class="ks-block__desc">
      Minimal config: sizing and <code>when</code> omitted, so the packager applies default grid
      bounds (1–12) and the block is always offered.
    </p>
  </div>
`);
