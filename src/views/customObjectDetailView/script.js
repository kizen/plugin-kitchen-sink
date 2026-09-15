// Kitchen Sink App · View · Custom Object Detail View
//
// Opened by Business Explorer's viewObject event script, which forwards the already-fetched
// object detail through args.object (read here on this.args, same pattern as summaryView).
// Display-only — ported from the reference SPA's renderObjectDetail, minus its "view records"
// drill-down and pipeline-stage rendering, kept out of this first minimal slice.

const { object } = this.args ?? {};

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

if (!object) {
  this.outputUI(`<div class="codv-body"><p class="codv-empty">No object was selected.</p></div>`);
} else {
  const meta = [
    ["API Name", object.object_name ? `<code>${escapeHtml(object.object_name)}</code>` : "—"],
    ["Entity Name", object.entity_name ? escapeHtml(object.entity_name) : "—"],
    ["Type", object.object_type ? escapeHtml(object.object_type) : "—"],
    ["Custom?", object.is_custom ? "Yes" : "No"],
    [
      "Owner",
      object.owner ? escapeHtml(object.owner.display_name ?? object.owner.full_name ?? "—") : "—",
    ],
    ["# Records", object.number_of_records != null ? String(object.number_of_records) : "—"],
    ["Allow Relations", object.allow_relations ? "Yes" : "No"],
    ["Allow On Forms", object.allow_on_forms ? "Yes" : "No"],
    ["Created", formatDate(object.created)],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="codv-row"><span class="codv-label">${escapeHtml(label)}</span><span class="codv-value">${val}</span></div>`)
    .join("");

  const description = object.description || object.ai_description;
  const descriptionSection = description
    ? `<div class="codv-section"><h4>Description</h4><p>${escapeHtml(description)}</p></div>`
    : "";

  const related = object.related_objects ?? [];
  const relatedSection = `
    <div class="codv-section">
      <h4>Related Objects${related.length ? ` (${related.length})` : ""}</h4>
      ${
        related.length
          ? `<ul class="codv-chip-list">${related
              .map(
                (r) =>
                  `<li class="codv-chip"><strong>${escapeHtml(r.entity_name ?? r.object_name ?? "Related Object")}</strong>${
                    r.object_name ? ` · <code>${escapeHtml(r.object_name)}</code>` : ""
                  }</li>`,
              )
              .join("")}</ul>`
          : `<p class="codv-empty">No related objects returned by the API.</p>`
      }
    </div>
  `;

  const actions = object.custom_actions ?? [];
  const actionsSection = `
    <div class="codv-section">
      <h4>Custom Actions${actions.length ? ` (${actions.length})` : ""}</h4>
      ${
        actions.length
          ? `<ul class="codv-chip-list">${actions
              .map(
                (a) =>
                  `<li class="codv-chip"><strong>${escapeHtml(a.name ?? "Action")}</strong>${
                    a.description ? `<p>${escapeHtml(a.description)}</p>` : ""
                  }</li>`,
              )
              .join("")}</ul>`
          : `<p class="codv-empty">No custom actions returned by the API.</p>`
      }
    </div>
  `;

  this.outputUI(`
    <div class="codv-body">
      <div class="codv-grid">${metaRows}</div>
      ${descriptionSection}
      ${relatedSection}
      ${actionsSection}
      <details class="codv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(object, null, 2))}</pre>
      </details>
    </div>
  `);
}
