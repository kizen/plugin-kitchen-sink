// Kitchen Sink App · View · Workflow Detail View
//
// Opened by Business Explorer's viewWorkflow event script, which forwards the fetched automation
// through args.automation. Display-only, except the Executions row, which opens
// workflowExecutionsView (eventScripts/viewExecutions.js) — ported from the reference SPA's
// renderWorkflowDetail, minus its CCDA-aware variable-value rendering, kept out of this pass.
//
// The exact shape of an automation's detail response (steps/triggers/variables field names)
// isn't pinned down by the Kizen API docs, so this looks for a few likely field names first and
// falls back to any array-of-objects whose key matches the expected concept — same heuristic the
// reference app uses (findEntityArray).

const { automation } = this.args ?? {};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const truncate = (str, n) => (str && str.length > n ? `${str.slice(0, n)}…` : (str ?? ""));

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

const pickFirst = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
};

const humanizeKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const findEntityArray = (obj, candidateKeys, fallbackRegex) => {
  for (const k of candidateKeys) {
    if (Array.isArray(obj[k])) return obj[k];
  }
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object" && fallbackRegex.test(k)) return v;
  }
  return null;
};

const renderEntityCard = (entity, index, opts) => {
  const type = pickFirst(entity, opts.typeKeys);
  const name = pickFirst(entity, opts.nameKeys);
  const description = pickFirst(entity, opts.descKeys);

  const known = new Set([...opts.typeKeys, ...opts.nameKeys, ...opts.descKeys, "id"]);
  const stats = {};
  Object.entries(entity).forEach(([k, v]) => {
    if (!known.has(k) && (typeof v === "number" || (typeof v === "string" && /^\d+$/.test(v)))) {
      stats[k] = v;
    }
  });

  const statChips = Object.keys(stats).length
    ? `<div class="wdv-stat-row">${Object.entries(stats)
        .map(([k, v]) => `<span class="wdv-stat-chip"><strong>${escapeHtml(humanizeKey(k))}:</strong> ${escapeHtml(v)}</span>`)
        .join("")}</div>`
    : "";

  return `
    <div class="wdv-card">
      <div class="wdv-card-header">
        <span class="wdv-card-index">${index + 1}</span>
        ${type ? `<span class="wdv-pill">${escapeHtml(String(type))}</span>` : ""}
        <strong>${escapeHtml(name ?? `${opts.fallbackLabel} ${index + 1}`)}</strong>
      </div>
      ${description ? `<div class="wdv-card-desc">${escapeHtml(description)}</div>` : ""}
      ${statChips}
    </div>
  `;
};

const renderVariablesTable = (variablesArr) => {
  const rows = variablesArr
    .map((v) => {
      const name = pickFirst(v, ["name", "variable_name", "key", "label"]) ?? "—";
      const type = pickFirst(v, ["type", "data_type", "var_type", "value_type"]) ?? "—";
      const rawValue = pickFirst(v, ["value", "default_value", "default", "initial_value"]);
      const displayValue =
        rawValue === undefined
          ? "—"
          : escapeHtml(truncate(typeof rawValue === "object" ? JSON.stringify(rawValue) : String(rawValue), 150));
      return `<tr><td><code>${escapeHtml(name)}</code></td><td>${escapeHtml(type)}</td><td>${displayValue}</td></tr>`;
    })
    .join("");
  return `<div class="wdv-table-scroll"><table class="wdv-table"><thead><tr><th>Name</th><th>Type</th><th>Value / Default</th></tr></thead><tbody>${rows}</tbody></table></div>`;
};

if (!automation) {
  this.outputUI(`<div class="wdv-body"><p class="wdv-empty">No workflow was selected.</p></div>`);
} else {
  const meta = [
    ["API Name", automation.api_name ? `<code>${escapeHtml(automation.api_name)}</code>` : "—"],
    ["Type", automation.type ? (automation.type === "global" ? "Global" : "Record-Based") : "—"],
    ["Status", automation.active !== undefined ? (automation.active ? "Active" : "Inactive") : "—"],
    ["Object", automation.custom_object ? escapeHtml(automation.custom_object.name ?? "—") : "—"],
    ["Folder", automation.folder ? escapeHtml(automation.folder.name ?? "—") : "—"],
    ["Revision", automation.revision ?? "—"],
    ["Created", formatDate(automation.created)],
    [
      "Created By",
      automation.created_by ? escapeHtml(automation.created_by.display_name ?? "—") : "—",
    ],
    [
      "Updated By",
      automation.updated_by ? escapeHtml(automation.updated_by.display_name ?? "—") : "—",
    ],
    [
      "Executions (Active / Paused / Done)",
      `
        <form class="wdv-inline-form" data-script="viewExecutions">
          <input type="hidden" name="automationId" value="${escapeHtml(automation.id ?? "")}" />
          <input type="hidden" name="automationName" value="${escapeHtml(automation.name ?? "")}" />
          <input type="hidden" name="active" value="${automation.number_active ?? 0}" />
          <input type="hidden" name="paused" value="${automation.number_paused ?? 0}" />
          <input type="hidden" name="completed" value="${automation.number_completed ?? 0}" />
          <button type="submit" class="wdv-link-btn">${automation.number_active ?? 0} / ${automation.number_paused ?? 0} / ${automation.number_completed ?? 0}</button>
        </form>
      `,
    ],
  ];

  const metaRows = meta
    .map(([label, val]) => `<div class="wdv-row"><span class="wdv-label">${escapeHtml(label)}</span><span class="wdv-value">${val}</span></div>`)
    .join("");

  const description = automation.user_description || automation.ai_description;
  const descriptionSection = description
    ? `<div class="wdv-section"><h4>Description</h4><p>${escapeHtml(description)}</p></div>`
    : "";

  const triggersArr = findEntityArray(automation, ["triggers", "trigger_list", "workflow_triggers"], /trigger/i);
  const triggersSection = `
    <div class="wdv-section">
      <h4>Triggers${triggersArr ? ` (${triggersArr.length})` : ""}</h4>
      ${
        !triggersArr || !triggersArr.length
          ? `<p class="wdv-empty">No trigger details returned by the API for this workflow.</p>`
          : triggersArr
              .map((t, i) =>
                renderEntityCard(t, i, {
                  typeKeys: ["trigger_type", "type", "kind"],
                  nameKeys: ["name", "label", "trigger_name", "title"],
                  descKeys: ["description", "user_description", "details", "notes"],
                  fallbackLabel: "Trigger",
                }),
              )
              .join("")
      }
    </div>
  `;

  const variablesArr = findEntityArray(
    automation,
    ["variables", "workflow_variables", "vars", "automation_variables"],
    /variable/i,
  );
  const variablesSection = `
    <div class="wdv-section">
      <h4>Variables${variablesArr ? ` (${variablesArr.length})` : ""}</h4>
      ${
        !variablesArr || !variablesArr.length
          ? `<p class="wdv-empty">No variable details returned by the API for this workflow.</p>`
          : renderVariablesTable(variablesArr)
      }
    </div>
  `;

  const stepsArr = findEntityArray(
    automation,
    ["steps", "automation_steps", "workflow_steps", "step_list", "flow_steps", "actions"],
    /step/i,
  );
  const stepsSection = `
    <div class="wdv-section">
      <h4>Steps${stepsArr ? ` (${stepsArr.length})` : ""}</h4>
      ${
        !stepsArr || !stepsArr.length
          ? `<p class="wdv-empty">No step details returned by the API for this workflow.</p>`
          : stepsArr
              .map((s, i) =>
                renderEntityCard(s, i, {
                  typeKeys: ["step_type", "type", "action_type", "kind"],
                  nameKeys: ["name", "label", "step_name", "title"],
                  descKeys: ["description", "user_description", "ai_description", "details", "notes"],
                  fallbackLabel: "Step",
                }),
              )
              .join("")
      }
    </div>
  `;

  this.outputUI(`
    <div class="wdv-body">
      <div class="wdv-grid">${metaRows}</div>
      ${descriptionSection}
      ${triggersSection}
      ${variablesSection}
      ${stepsSection}
      <details class="wdv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify(automation, null, 2))}</pre>
      </details>
    </div>
  `);
}
