// Kitchen Sink App · View · Activity Object Detail View
//
// Opened by Business Explorer's viewActivityObject event script, which forwards
// { object, references } through args (object always present; references is null if that
// best-effort fetch failed). Display-only — ported from the reference SPA's
// renderActivityObjectDetail, minus its cross-links into other tabs (view-object-from-reference,
// view-workflow-from-reference) and the deep nested per-reference-type listings, kept out of this
// first pass.

const { object, references } = this.args ?? {};

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
  this.outputUI(`<div class="aodv-body"><p class="aodv-empty">No activity object was selected.</p></div>`);
} else {
  const meta = [
    ["API Name", object.api_name ? `<code>${escapeHtml(object.api_name)}</code>` : "—"],
    ["Enabled?", object.enabled ? "Yes" : "No"],
    ["Editable?", object.is_editable ? "Yes" : "No"],
    ["Association Required?", object.is_association_required ? "Yes" : "No"],
    ["Association Mode", object.association_mode ? humanizeKey(object.association_mode) : "—"],
    ["Submission Action", object.submission_action ? humanizeKey(object.submission_action) : "—"],
    ["# Submissions", object.n_submissions != null ? String(object.n_submissions) : "—"],
    [
      "Owner",
      object.owner ? escapeHtml(object.owner.display_name ?? object.owner.full_name ?? "—") : "—",
    ],
    ["Created", formatDate(object.created)],
    ["Calendar Sync Enabled?", object.calendar_sync_enabled ? "Yes" : "No"],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="aodv-row"><span class="aodv-label">${escapeHtml(label)}</span><span class="aodv-value">${val}</span></div>`)
    .join("");

  const description = object.description || object.ai_description;
  const descriptionSection = description
    ? `<div class="aodv-section"><h4>Description</h4><p>${escapeHtml(description)}</p></div>`
    : "";

  const associated = (object.associated_objects ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const customObjects = object.custom_objects ?? [];

  let associatedSectionBody;
  if (associated.length) {
    associatedSectionBody = `<ul class="aodv-chip-list">${associated
      .map((a) => {
        const co = a.custom_object ?? {};
        const title = co.entity_name ?? co.object_name ?? co.name ?? "Object";
        return `<li class="aodv-chip"><strong>${escapeHtml(title)}</strong>${
          co.object_name ? ` · <code>${escapeHtml(co.object_name)}</code>` : ""
        }${a.is_required ? " · Required" : ""}${a.is_readonly ? " · Read-only" : ""}</li>`;
      })
      .join("")}</ul>`;
  } else if (customObjects.length) {
    associatedSectionBody = `<ul class="aodv-chip-list">${customObjects
      .map((co) => {
        const title = co.entity_name ?? co.name ?? "Object";
        return `<li class="aodv-chip"><strong>${escapeHtml(title)}</strong>${
          co.object_name ? ` · <code>${escapeHtml(co.object_name)}</code>` : ""
        }${co.object_type ? ` · ${escapeHtml(humanizeKey(co.object_type))}` : ""}</li>`;
      })
      .join("")}</ul>`;
  } else {
    associatedSectionBody = `<p class="aodv-empty">No associated objects returned by the API.</p>`;
  }

  const associatedSection = `<div class="aodv-section"><h4>Associated Objects</h4>${associatedSectionBody}</div>`;

  let referencesSection;
  if (!references) {
    referencesSection = `<div class="aodv-section"><h4>References</h4><p class="aodv-empty">Usage references failed to load.</p></div>`;
  } else {
    const summaryChips = [
      ["Scheduled Activities", references.scheduled_activities],
      ["Logged Activities", references.logged_activities],
      ["Automations", references.automations?.length],
      ["Smart Connectors", references.smart_connectors?.length],
      ["Dashboards", references.dashboards?.length],
      ["Homepages", references.homepages?.length],
      ["Filter Groups", references.filter_groups?.length],
      ["Toolbar Templates", references.toolbar_templates?.length],
    ].filter(([, value]) => value !== undefined && value !== null);

    referencesSection = `
      <div class="aodv-section">
        <h4>References</h4>
        ${
          summaryChips.length
            ? `<div class="aodv-stat-row">${summaryChips
                .map(([label, value]) => `<span class="aodv-stat-chip"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`)
                .join("")}</div>`
            : `<p class="aodv-empty">No usage references returned by the API.</p>`
        }
      </div>
    `;
  }

  this.outputUI(`
    <div class="aodv-body">
      <div class="aodv-grid">${metaRows}</div>
      ${descriptionSection}
      ${associatedSection}
      ${referencesSection}
      <details class="aodv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(object, null, 2))}</pre>
      </details>
    </div>
  `);
}
