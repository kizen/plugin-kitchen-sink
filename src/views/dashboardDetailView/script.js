// Kitchen Sink App · View · Dashboard Detail View
//
// Opened by Activity Object Detail View's viewDashboardFromReference event script, which forwards
// { dashboard, kind } through args — the already-fetched dashboard, and "Dashboard" or
// "Homepage" for the title/empty-state text, since both reference types share the same
// GET /dashboards/{id} endpoint and response shape in the reference SPA. Display-only — ported
// from the reference SPA's openDashboardDetail.

const { dashboard, kind } = this.args ?? {};
const label = kind ?? "Dashboard";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const humanizeKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

if (!dashboard) {
  this.outputUI(`<div class="ddv-body"><p class="ddv-empty">No ${escapeHtml(label)} was selected.</p></div>`);
} else {
  const meta = [
    ["API Name", dashboard.api_name ? `<code>${escapeHtml(dashboard.api_name)}</code>` : "—"],
    ["Type", dashboard.type ? humanizeKey(dashboard.type) : "—"],
    ["Published?", dashboard.published ? "Yes" : "No"],
    ["Hidden?", dashboard.hidden ? "Yes" : "No"],
    ["Employee Access", dashboard.employee_access ? humanizeKey(dashboard.employee_access) : "—"],
  ];

  const metaRows = meta
    .map(([metaLabel, val]) => `<div class="ddv-row"><span class="ddv-label">${escapeHtml(metaLabel)}</span><span class="ddv-value">${val}</span></div>`)
    .join("");

  const dashlets = dashboard.dashlets ?? [];
  const dashletsSection = `
    <div class="ddv-section">
      <h4>Dashlets${dashlets.length ? ` (${dashlets.length})` : ""}</h4>
      ${
        dashlets.length
          ? `<ul class="ddv-chip-list">${dashlets
              .map((dl, i) => `<li class="ddv-chip">${escapeHtml(dl.name ?? `Dashlet ${i + 1}`)}</li>`)
              .join("")}</ul>`
          : `<p class="ddv-empty">No dashlets returned by the API.</p>`
      }
    </div>
  `;

  this.outputUI(`
    <div class="ddv-body">
      <div class="ddv-grid">${metaRows}</div>
      ${dashletsSection}
      <details class="ddv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(dashboard, null, 2))}</pre>
      </details>
    </div>
  `);
}
