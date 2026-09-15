// Kitchen Sink App · View · Toolbar Template Detail View
//
// Opened by Activity Object Detail View's viewToolbarTemplateFromReference event script, which
// forwards the already-fetched toolbar template through args.toolbarTemplate. Display-only —
// ported from the reference SPA's openToolbarTemplateDetail/simpleDetailModal.

const { toolbarTemplate } = this.args ?? {};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? escapeHtml(iso)
    : d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const humanizeKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

if (!toolbarTemplate) {
  this.outputUI(`<div class="ttdv-body"><p class="ttdv-empty">No toolbar template was selected.</p></div>`);
} else {
  const meta = [
    ["Employee Access", toolbarTemplate.employee_access ? humanizeKey(toolbarTemplate.employee_access) : "—"],
    ["Sharing Stats", toolbarTemplate.sharing_stats ?? "—"],
    ["Created", formatDate(toolbarTemplate.created)],
    ["Updated", formatDate(toolbarTemplate.updated)],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="ttdv-row"><span class="ttdv-label">${escapeHtml(label)}</span><span class="ttdv-value">${val}</span></div>`)
    .join("");

  this.outputUI(`
    <div class="ttdv-body">
      <div class="ttdv-grid">${metaRows}</div>
      <details class="ttdv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(toolbarTemplate, null, 2))}</pre>
      </details>
    </div>
  `);
}
