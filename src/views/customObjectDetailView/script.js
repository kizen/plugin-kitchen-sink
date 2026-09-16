// Kitchen Sink App · View · Custom Object Detail View
//
// Opened by Business Explorer's viewObject event script, which forwards the already-fetched
// object detail through args.object (read here on this.args, same pattern as summaryView).
// Display-only, except "# Records", which opens objectRecordsView (eventScripts/viewRecords.js)
// — the same view My Objects Block already uses. Ported from the reference SPA's
// renderObjectDetail.

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

const humanizeKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
    [
      "# Records",
      object.number_of_records != null
        ? `
          <form class="codv-inline-form" data-script="viewRecords">
            <input type="hidden" name="objectId" value="${escapeHtml(object.id ?? "")}" />
            <input type="hidden" name="objectType" value="${escapeHtml(object.object_type ?? "standard")}" />
            <input type="hidden" name="objectName" value="${escapeHtml(object.name ?? object.entity_name ?? "Object")}" />
            <button type="submit" class="codv-link-btn">${escapeHtml(object.number_of_records)}</button>
          </form>
        `
        : "—",
    ],
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

  const isPipeline = object.object_type === "pipeline";

  const pipelineStagesSection = isPipeline
    ? (() => {
        const stages = (object.pipeline?.stages ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return `
          <div class="codv-section">
            <h4>Pipeline Stages${stages.length ? ` (${stages.length})` : ""}</h4>
            ${
              stages.length
                ? `<ul class="codv-chip-list">${stages
                    .map(
                      (s, i) => `
                        <li class="codv-chip">
                          <strong>${escapeHtml(s.name ?? `Stage ${i + 1}`)}</strong>
                          <div class="codv-stat-row">
                            ${s.status ? `<span class="codv-stat-chip"><strong>Status:</strong> ${escapeHtml(humanizeKey(s.status))}</span>` : ""}
                            ${
                              s.percentage_chance_to_close != null
                                ? `<span class="codv-stat-chip"><strong>Chance to Close:</strong> ${escapeHtml(s.percentage_chance_to_close)}%</span>`
                                : ""
                            }
                          </div>
                        </li>
                      `,
                    )
                    .join("")}</ul>`
                : `<p class="codv-empty">No pipeline stages returned by the API.</p>`
            }
          </div>
        `;
      })()
    : "";

  const layouts = object.record_layouts ?? [];
  const layoutsSection = layouts.length
    ? `<div class="codv-section"><h4>Record Layouts (${layouts.length})</h4><p>${escapeHtml(layouts.map((l) => l.name).join(", "))}</p></div>`
    : "";

  const pipelineReasonsSection = isPipeline
    ? (() => {
        const lost = (object.reasons_lost ?? []).map((r) => r.name).filter(Boolean);
        const disqualified = (object.reasons_disqualified ?? []).map((r) => r.name).filter(Boolean);
        if (!lost.length && !disqualified.length) return "";
        return `
          <div class="codv-section">
            <h4>Pipeline Reasons</h4>
            ${lost.length ? `<p><strong>Lost:</strong> ${escapeHtml(lost.join(", "))}</p>` : ""}
            ${disqualified.length ? `<p><strong>Disqualified:</strong> ${escapeHtml(disqualified.join(", "))}</p>` : ""}
          </div>
        `;
      })()
    : "";

  this.outputUI(`
    <div class="codv-body">
      <div class="codv-grid">${metaRows}</div>
      ${descriptionSection}
      ${pipelineStagesSection}
      ${relatedSection}
      ${actionsSection}
      ${layoutsSection}
      ${pipelineReasonsSection}
      <details class="codv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(object, null, 2))}</pre>
      </details>
    </div>
  `);
}
