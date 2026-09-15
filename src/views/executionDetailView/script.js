// Kitchen Sink App · View · Execution Detail View
//
// Opened by workflowExecutionsView's viewExecution event script, which forwards
// { execution, history, variables } through args — all three already fetched in parallel, so
// this view is purely display. Ported from the reference SPA's renderExecutionDetail, minus its
// "Download Log" button (file downloads aren't a plugin-engine primitive used elsewhere in this
// repo) and the log-truncation "Show more" toggle (needs a live DOM event the worker doesn't have
// — same simplification as elsewhere in this plugin, plain truncation instead).

const { execution, history, variables } = this.args ?? {};

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

const humanizeKey = (k) =>
  String(k)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const pickFirst = (obj, keys) => {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
};

const executionStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "active") return "edv-pill--good";
  if (["failed", "cancelled", "paused_by_failure"].includes(s)) return "edv-pill--bad";
  if (s.startsWith("paused")) return "edv-pill--warn";
  return "edv-pill--neutral";
};

// The /variables endpoint's documented response schema looks like a copy-paste placeholder (it
// matches the execution object's own schema, not a variables shape), so this normalizes whatever
// actually comes back into a {name, value} array, detected structurally rather than assumed to
// live under one specific key. Confirmed live entry shape per variable (per the reference SPA):
// { persisted_value: { data_type, value: { raw_value, display_value } }, variable: { name, data_type } }.
const looksLikePersistedVariableMap = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const values = Object.values(obj);
  return values.length > 0 && values.every((v) => v && typeof v === "object" && ("persisted_value" in v || "variable" in v));
};

const persistedVariableMapToArray = (map) =>
  Object.entries(map).map(([key, entry]) => ({
    name: entry?.variable?.name ?? key,
    type: entry?.persisted_value?.data_type ?? entry?.variable?.data_type,
    value: entry?.persisted_value?.value
      ? (entry.persisted_value.value.display_value ?? entry.persisted_value.value.raw_value)
      : undefined,
  }));

const variablesToArray = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.variables)) return data.variables;
  if (Array.isArray(data.results)) return data.results;
  if (looksLikePersistedVariableMap(data.variables)) return persistedVariableMapToArray(data.variables);
  if (looksLikePersistedVariableMap(data)) return persistedVariableMapToArray(data);
  if (typeof data === "object") {
    const ignore = new Set(["id", "automation_id", "client_id", "record_id", "status", "trigger_history_id", "debug_mode"]);
    const entries = Object.entries(data).filter(([k, v]) => !ignore.has(k) && (typeof v !== "object" || v === null));
    if (entries.length) return entries.map(([name, value]) => ({ name, value }));
  }
  return null;
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
  return `<div class="edv-table-scroll"><table class="edv-table"><thead><tr><th>Name</th><th>Type</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table></div>`;
};

const renderHistoryCard = (h, index) => {
  const status = h.status ?? "—";
  const info =
    h.step && (h.step.type || h.step.description)
      ? h.step
      : h.trigger && (h.trigger.type || h.trigger.description)
        ? h.trigger
        : null;
  const type = info?.type ? humanizeKey(info.type) : h.trigger_id ? "Trigger" : "Step";
  const description = info?.description ?? "";

  const chips = [];
  if (h.execution_time_ms !== undefined && h.execution_time_ms !== null) {
    chips.push(`<span class="edv-stat-chip"><strong>Duration:</strong> ${escapeHtml(h.execution_time_ms)} ms</span>`);
  }
  if (h.num_running_async_jobs) {
    chips.push(`<span class="edv-stat-chip"><strong>Async Jobs:</strong> ${escapeHtml(h.num_running_async_jobs)}</span>`);
  }
  if (h.step_output !== undefined && h.step_output !== null) {
    chips.push(`<span class="edv-stat-chip"><strong>Has Output:</strong> ${h.step_output ? "Yes" : "No"}</span>`);
  }

  const errorText = h.error_description || h.error;

  // detailed_log is documented as a string but can arrive as an object in practice.
  const logText = h.detailed_log
    ? typeof h.detailed_log === "object"
      ? JSON.stringify(h.detailed_log, null, 2)
      : String(h.detailed_log)
    : null;

  return `
    <div class="edv-card">
      <div class="edv-card-header">
        <span class="edv-card-index">${index + 1}</span>
        <span class="edv-pill ${executionStatusClass(status)}">${escapeHtml(humanizeKey(status))}</span>
        <strong>${escapeHtml(type)}</strong>
      </div>
      ${description ? `<div class="edv-card-desc">${escapeHtml(description)}</div>` : ""}
      ${errorText ? `<div class="edv-card-desc edv-card-desc--error">${escapeHtml(errorText)}</div>` : ""}
      ${chips.length ? `<div class="edv-stat-row">${chips.join("")}</div>` : ""}
      ${logText ? `<div class="edv-card-desc"><strong>Log:</strong> ${escapeHtml(truncate(logText, 300))}</div>` : ""}
    </div>
  `;
};

if (!execution) {
  this.outputUI(`<div class="edv-body"><p class="edv-empty">No execution was selected.</p></div>`);
} else {
  const meta = [
    [
      "Status",
      `<span class="edv-pill ${executionStatusClass(execution.status)}">${escapeHtml(humanizeKey(execution.status ?? "—"))}</span>`,
    ],
    ["Priority", execution.priority ? humanizeKey(execution.priority) : "—"],
    ["Debug Mode", execution.debug_mode ? "Yes" : "No"],
    ["Record", execution.record ? escapeHtml(execution.record.display_name ?? "—") : "—"],
    ["Automation", execution.automation ? escapeHtml(execution.automation.name ?? "—") : "—"],
    ["Created", formatDate(execution.created)],
    ["Updated", formatDate(execution.updated)],
    ["In Queue", execution.in_queue ? "Yes" : "No"],
    ["Throttled", execution.is_throttled ? "Yes" : "No"],
    ["Steps In Retry Queue", execution.has_steps_in_retry_queue ? "Yes" : "No"],
    ["Paused On Step", execution.paused_on_step?.label ? escapeHtml(execution.paused_on_step.label) : "—"],
  ];
  if (execution.warning) meta.push(["Warning", escapeHtml(execution.warning)]);

  const metaRows = meta
    .map(([label, val]) => `<div class="edv-row"><span class="edv-label">${escapeHtml(label)}</span><span class="edv-value">${val}</span></div>`)
    .join("");

  let variablesSection;
  if (!variables) {
    variablesSection = `<p class="edv-empty">Could not load variables.</p>`;
  } else {
    const varsArr = variablesToArray(variables);
    variablesSection = varsArr && varsArr.length ? renderVariablesTable(varsArr) : `<p class="edv-empty">No variable data returned by the API for this execution.</p>`;
  }

  const historyRows = history?.results ?? [];
  const historyCount = history?.count ?? historyRows.length;

  this.outputUI(`
    <div class="edv-body">
      <div class="edv-grid">${metaRows}</div>
      <div class="edv-section">
        <h4>Variables</h4>
        ${variablesSection}
      </div>
      <div class="edv-section">
        <h4>Step History${historyCount ? ` (${historyCount})` : ""}</h4>
        ${
          historyRows.length
            ? historyRows.map((h, i) => renderHistoryCard(h, i)).join("")
            : `<p class="edv-empty">No step history returned for this execution.</p>`
        }
      </div>
      <details class="edv-raw">
        <summary>Raw response JSON</summary>
        <pre>${escapeHtml(JSON.stringify({ execution, history, variables }, null, 2))}</pre>
      </details>
    </div>
  `);
}
