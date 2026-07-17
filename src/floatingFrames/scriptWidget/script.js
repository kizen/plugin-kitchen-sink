// Kitchen Sink App · Floating Frame · Script Widget
//
// A script-rendered frame paints markup with this.outputUI and wires interactivity through
// data-script buttons linked to handlers in eventScripts/. Five buttons each call one frame-only context method
// (hide/collapse/expand/hideHeader/showHeader). hideHeader/showHeader are honored only on fixed
// frames (default_position *-fixed - a non-fixed frame is dragged by its header) so this one is
// bottom-left-fixed. The sixth button reuses the dad_jokes service to show a frame is a full worker
// context. show() is called automatically, so nothing here explicitly needs to show the initial frame.

this.outputUI(`
  <div class="sw-widget">
    <p class="sw-lead">Frame chrome + dad_jokes demo</p>
    <div class="sw-buttons">
      <button class="sw-btn" data-script="hide">hide()</button>
      <button class="sw-btn" data-script="collapse">collapse()</button>
      <button class="sw-btn" data-script="expand">expand()</button>
      <button class="sw-btn" data-script="hideHeader">hideHeader()</button>
      <button class="sw-btn" data-script="showHeader">showHeader()</button>
      <button class="sw-btn sw-btn--accent" data-script="fetchJoke">Fetch a dad joke</button>
    </div>
  </div>
`);
