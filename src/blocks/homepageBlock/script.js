// Kitchen Sink App · Block · Homepage Block
//
// `types: ["homepages"]` scopes this block to the Homepage picker. Its point is to show that a
// block worker can open one of this plugin's views in a modal with `showViewInModal` - the same
// primitive toolbar items and actions use - and read the submitted form values back. The launch
// and result handling live in eventScripts/openView.js.

this.outputUI(`
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge">HOMEPAGE</span>
      <span class="ks-block__title">Homepage Block</span>
    </div>
    <p class="ks-block__desc">
      Opens the <code>formview</code> view in a modal and logs what it returns.
    </p>
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="openView">Open a form modal</button>
    </div>
  </div>
`);
