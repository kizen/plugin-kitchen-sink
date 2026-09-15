// Kitchen Sink App · View · Smart Connector Detail View
//
// Opened by Activity Object Detail View's viewSmartConnectorFromReference event script, which
// forwards the already-fetched Smart Connector through args.smartConnector. Display-only —
// ported from the reference SPA's openSmartConnectorDetail/simpleDetailModal.

const { smartConnector } = this.args ?? {};

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

if (!smartConnector) {
  this.outputUI(`<div class="scdv-body"><p class="scdv-empty">No Smart Connector was selected.</p></div>`);
} else {
  const meta = [
    ["API Name", smartConnector.api_name ? `<code>${escapeHtml(smartConnector.api_name)}</code>` : "—"],
    ["Connector Type", smartConnector.connector_type ? humanizeKey(smartConnector.connector_type) : "—"],
    ["Status", smartConnector.status ? humanizeKey(smartConnector.status) : "—"],
    [
      "Owner",
      smartConnector.owner ? escapeHtml(smartConnector.owner.display_name ?? smartConnector.owner.full_name ?? "—") : "—",
    ],
    ["Max Concurrent Executions", smartConnector.max_concurrent_executions ?? "—"],
    ["SQL Required", smartConnector.sql_required ? "Yes" : "No"],
    ["SQL Enabled", smartConnector.sql_enabled ? "Yes" : "No"],
    ["Used Count", smartConnector.stats?.used_count ?? "—"],
    ["Last Used", smartConnector.last_used_at ? formatDate(smartConnector.last_used_at) : "—"],
    ["Created", formatDate(smartConnector.created)],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="scdv-row"><span class="scdv-label">${escapeHtml(label)}</span><span class="scdv-value">${val}</span></div>`)
    .join("");

  const descriptionSection = smartConnector.description
    ? `<div class="scdv-section"><h4>Description</h4><p>${escapeHtml(smartConnector.description)}</p></div>`
    : "";

  this.outputUI(`
    <div class="scdv-body">
      <div class="scdv-grid">${metaRows}</div>
      ${descriptionSection}
      <details class="scdv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(smartConnector, null, 2))}</pre>
      </details>
    </div>
  `);
}
