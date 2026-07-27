// Kitchen Sink App · View · Form View
//
// A form view opened with host chrome via showViewInModal("formview", { options: {...} }). The
// host confirm button runs native validation on every <form> (required/type/etc.) and the script
// trusts it, then collects FormData.getAll() into result.values.formData with every value
// array-wrapped ("Jane" → ["Jane"]; two checked boxes → ["email","phone"]). No event script runs
// here, so this view has no eventScripts/, unlike framelessView. Run "Modal Launcher" → "Framed".

this.outputUI(`
<form class="fv-body">
  <div class="fv-field">
    <label class="fv-label" for="fv-full-name">Name</label>
    <input class="fv-input" type="text" id="fv-full-name" name="full-name" placeholder="Jane Smith" required />
  </div>

  <div class="fv-field">
    <label class="fv-label" for="fv-email">Email</label>
    <input class="fv-input" type="email" id="fv-email" name="email" placeholder="jane@example.com" />
  </div>

  <div class="fv-field">
    <label class="fv-label" for="fv-topic">Topic</label>
    <select class="fv-input" id="fv-topic" name="topic">
      <option value="question">Question</option>
      <option value="feedback">Feedback</option>
      <option value="bug-report">Bug report</option>
    </select>
  </div>

  <fieldset class="fv-field fv-fieldset">
    <legend class="fv-label">Contact channels</legend>
    <label class="fv-check"><input type="checkbox" name="channels" value="email" checked /> Email</label>
    <label class="fv-check"><input type="checkbox" name="channels" value="phone" /> Phone</label>
    <label class="fv-check"><input type="checkbox" name="channels" value="slack" /> Slack</label>
  </fieldset>

  <div class="fv-field">
    <label class="fv-label" for="fv-notes">Notes</label>
    <textarea class="fv-input fv-textarea" id="fv-notes" name="notes" placeholder="Anything else?"></textarea>
  </div>
</form>
`);
