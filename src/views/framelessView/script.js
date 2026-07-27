// Kitchen Sink App · View · Frameless View
//
// A form view for frameless: true. The host renders no chrome, so the view owns its header,
// footer, and buttons, and closes its own modal. Interactivity is wired via data-script (no DOM):
// the <form>'s data-script="submit" → eventScripts/submit.js (driven by the real submit button, so
// native validation runs first), and the cancel button's data-script="cancel" → cancel.js. Each
// closes the modal with this.closeModal(values, canceled). formView, by contrast, leans on host
// chrome to collect and close. Run "Modal Launcher" → "Frameless".

this.outputUI(`
<form class="flv-layout" data-script="submit">
  <div class="flv-header">
    <h2 class="flv-title">Frameless view</h2>
    <p class="flv-subtitle">No host chrome — this view owns its own header and buttons.</p>
  </div>

  <div class="flv-body">
    <div class="flv-field">
      <label class="flv-label" for="flv-display-name">Display name</label>
      <input class="flv-input" type="text" id="flv-display-name" name="display-name" placeholder="Jane Smith" required />
    </div>

    <div class="flv-field">
      <label class="flv-label" for="flv-message">Message</label>
      <textarea class="flv-input flv-textarea" id="flv-message" name="message" placeholder="Say something..."></textarea>
    </div>
  </div>

  <div class="flv-footer">
    <button class="flv-btn flv-btn--cancel" type="button" data-script="cancel">Cancel</button>
    <button class="flv-btn flv-btn--submit" type="submit">Submit</button>
  </div>
</form>
`);
