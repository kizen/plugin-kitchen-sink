// Kitchen Sink App · View · Activity Object Detail View
//
// Opened by Business Explorer's viewActivityObject event script, which forwards
// { object, references } through args (object always present; references is null if that
// best-effort fetch failed). Display-only, except each item under References, which opens its
// own detail view: Automations -> workflowDetailView, Smart Connectors ->
// smartConnectorDetailView, Dashboards/Homepages -> dashboardDetailView (shared, told apart by a
// "kind" field), Filter Groups -> filterGroupDetailView, Toolbar Templates ->
// toolbarTemplateDetailView. Each is a modal opened from inside another modal — the same
// showViewInModal primitive every worker context uses, nested.

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

// Nested list of one reference type (Automations, Smart Connectors, ...) under the References
// section. `chipBuilder` is optional: (item) => [{label, value}] stat chips shown per item.
// `titleHtml` is optional: (item) => HTML string for the title, falling back to plain text.
const renderUsageSubsection = (label, arr, chipBuilder, titleHtml) => {
  if (!arr || !arr.length) return "";

  const items = arr
    .map((item) => {
      const chips = (chipBuilder ? chipBuilder(item) : []).filter(
        (c) => c.value !== undefined && c.value !== null && c.value !== "",
      );
      const title = titleHtml?.(item) ?? `<strong>${escapeHtml(item.display_name ?? "—")}</strong>`;
      return `
        <li class="aodv-chip">
          ${title}
          ${
            chips.length
              ? `<div class="aodv-stat-row">${chips
                  .map((c) => `<span class="aodv-stat-chip"><strong>${escapeHtml(c.label)}:</strong> ${escapeHtml(c.value)}</span>`)
                  .join("")}</div>`
              : ""
          }
        </li>
      `;
    })
    .join("");

  return `
    <div class="aodv-subsection">
      <div class="aodv-subsection-title">${escapeHtml(label)} (${arr.length})</div>
      <ul class="aodv-chip-list">${items}</ul>
    </div>
  `;
};

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

    const automationsSubsection = renderUsageSubsection(
      "Automations",
      references.automations,
      (a) => [
        { label: "Steps", value: a.steps?.length || null },
        { label: "Triggers", value: a.triggers?.length || null },
        { label: "Conditions", value: a.conditions?.length || null },
        { label: "Variables", value: a.variables?.length || null },
        { label: "Goals", value: a.goals?.length || null },
      ],
      (a) =>
        a.id
          ? `
            <form class="aodv-inline-form" data-script="viewWorkflowFromReference">
              <input type="hidden" name="automationId" value="${escapeHtml(a.id)}" />
              <button type="submit" class="aodv-link-btn">${escapeHtml(a.display_name ?? "Workflow")}</button>
            </form>
          `
          : null,
    );

    const smartConnectorsSubsection = renderUsageSubsection(
      "Smart Connectors",
      references.smart_connectors,
      null,
      (sc) =>
        sc.id
          ? `
            <form class="aodv-inline-form" data-script="viewSmartConnectorFromReference">
              <input type="hidden" name="smartConnectorId" value="${escapeHtml(sc.id)}" />
              <button type="submit" class="aodv-link-btn">${escapeHtml(sc.display_name ?? "Smart Connector")}</button>
            </form>
          `
          : null,
    );

    const dashboardTitle = (kind) => (d) =>
      d.id
        ? `
          <form class="aodv-inline-form" data-script="viewDashboardFromReference">
            <input type="hidden" name="dashboardId" value="${escapeHtml(d.id)}" />
            <input type="hidden" name="kind" value="${escapeHtml(kind)}" />
            <button type="submit" class="aodv-link-btn">${escapeHtml(d.display_name ?? kind)}</button>
          </form>
        `
        : null;

    const dashboardsSubsection = renderUsageSubsection(
      "Dashboards",
      references.dashboards,
      (d) => [{ label: "Dashlets", value: d.dashlets?.length || null }],
      dashboardTitle("Dashboard"),
    );
    const homepagesSubsection = renderUsageSubsection(
      "Homepages",
      references.homepages,
      (d) => [{ label: "Dashlets", value: d.dashlets?.length || null }],
      dashboardTitle("Homepage"),
    );
    const filterGroupsSubsection = renderUsageSubsection(
      "Filter Groups",
      references.filter_groups,
      (f) => [{ label: "Object", value: f.custom_object_name }],
      (f) =>
        f.id && f.custom_object_id
          ? `
            <form class="aodv-inline-form" data-script="viewFilterGroupFromReference">
              <input type="hidden" name="objectId" value="${escapeHtml(f.custom_object_id)}" />
              <input type="hidden" name="filterGroupId" value="${escapeHtml(f.id)}" />
              <button type="submit" class="aodv-link-btn">${escapeHtml(f.display_name ?? "Filter Group")}</button>
            </form>
          `
          : null,
    );
    const toolbarTemplatesSubsection = renderUsageSubsection(
      "Toolbar Templates",
      references.toolbar_templates,
      null,
      (tt) =>
        tt.id
          ? `
            <form class="aodv-inline-form" data-script="viewToolbarTemplateFromReference">
              <input type="hidden" name="toolbarTemplateId" value="${escapeHtml(tt.id)}" />
              <button type="submit" class="aodv-link-btn">${escapeHtml(tt.display_name ?? "Toolbar Template")}</button>
            </form>
          `
          : null,
    );

    const nothingElse =
      !references.automations?.length &&
      !references.smart_connectors?.length &&
      !references.dashboards?.length &&
      !references.homepages?.length &&
      !references.filter_groups?.length &&
      !references.toolbar_templates?.length;

    referencesSection = `
      <div class="aodv-section">
        <h4>References</h4>
        ${
          summaryChips.length
            ? `<div class="aodv-stat-row">${summaryChips
                .map(([label, value]) => `<span class="aodv-stat-chip"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`)
                .join("")}</div>`
            : ""
        }
        ${automationsSubsection}
        ${smartConnectorsSubsection}
        ${dashboardsSubsection}
        ${homepagesSubsection}
        ${filterGroupsSubsection}
        ${toolbarTemplatesSubsection}
        ${nothingElse ? `<p class="aodv-empty">Not referenced by any automations, Smart Connectors, dashboards, or filter groups.</p>` : ""}
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
