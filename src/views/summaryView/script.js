// Kitchen Sink App · View · Summary View
//
// A display-only view with no form and no event scripts. It demonstrates modal chaining: Modal
// Launcher opens a form view, then opens this one with the submitted data forwarded through args
// (read here on this.args). The table shows each field's raw value beside its display value so the
// array-wrapping is visible.

const formData = this.args?.formData ?? {};

// Escape submitted text — outputUI strips scripts, but raw < / & could still break the markup.
const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const rows = Object.entries(formData)
  .map(([name, values]) => {
    // Every value is an array (FormData.getAll); join to unwrap singles and multi-value fields alike.
    const display = values.filter((value) => value !== "").join(", ");

    return `
      <tr>
        <td class="sv-name">${escapeHtml(name)}</td>
        <td class="sv-raw"><code>${escapeHtml(JSON.stringify(values))}</code></td>
        <td class="sv-display">${display ? escapeHtml(display) : `<span class="sv-empty">empty</span>`}</td>
      </tr>`;
  })
  .join("");

this.outputUI(`
<div class="sv-body">
  <p class="sv-intro">
    Forwarded from the previous modal via <code>args.formData</code>. Note the raw column:
    every field is array-wrapped, even single inputs.
  </p>
  <table class="sv-table">
    <thead>
      <tr><th>Field</th><th>Raw value</th><th>Display value</th></tr>
    </thead>
    <tbody>
      ${rows || `<tr><td class="sv-empty" colspan="3">No form data was forwarded.</td></tr>`}
    </tbody>
  </table>
</div>
`);
