// Kitchen Sink App · View · Filter Group Detail View
//
// Opened by Activity Object Detail View's viewFilterGroupFromReference event script, which
// forwards the already-fetched filter group through args.filterGroup. Display-only — ported from
// the reference SPA's openFilterGroupDetail/simpleDetailModal.

const { filterGroup } = this.args ?? {};

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

if (!filterGroup) {
  this.outputUI(`<div class="fgdv-body"><p class="fgdv-empty">No filter group was selected.</p></div>`);
} else {
  const meta = [
    ["Hidden?", filterGroup.hidden ? "Yes" : "No"],
    ["Created", formatDate(filterGroup.created)],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="fgdv-row"><span class="fgdv-label">${escapeHtml(label)}</span><span class="fgdv-value">${val}</span></div>`)
    .join("");

  this.outputUI(`
    <div class="fgdv-body">
      <div class="fgdv-grid">${metaRows}</div>
      <details class="fgdv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(filterGroup, null, 2))}</pre>
      </details>
    </div>
  `);
}
