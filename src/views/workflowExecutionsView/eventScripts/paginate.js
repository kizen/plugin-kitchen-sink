// Kitchen Sink App · View · Workflow Executions View · paginate
//
// Fired by either pager <form data-script="paginate"> submit, carrying the target cursor
// (prev_cursor or next_cursor from the last render) as a hidden input.

// Shared core for workflowExecutionsView, duplicated across script.js / eventScripts/filterStatus.js
// / eventScripts/paginate.js — same reasoning as Business Explorer: each data-script dispatch is a
// fresh worker with no shared module system.
//
// Ground-truth note: the execution-list endpoint (GET /automation2/automation-execution) is
// cursor-paginated and its `count` field is only the current page's row count, not a true total
// (confirmed against real data in the reference SPA). We deliberately don't replicate its
// "walk every page to compute a true All total" background job — too many requests for one
// dispatch. Known counts (active/paused/completed) come from the automation's own summary object,
// passed in via args; other statuses (cancelled, failed, paused_by_automation, paused_by_failure)
// filter but show no count badge.

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

// "Paused" on the workflow summary rolls up three distinct underlying statuses — querying
// "paused" alone undercounts (confirmed in the reference SPA against real data).
const STATUS_ROLLUPS = { paused: "paused,paused_by_automation,paused_by_failure" };
const statusFilterQueryValue = (status) => STATUS_ROLLUPS[status] || status;

const STATUS_OPTIONS = ["", "active", "paused", "completed", "cancelled", "paused_by_automation", "paused_by_failure", "failed"];

const executionStatusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "active") return "wev-pill--good";
  if (["failed", "cancelled", "paused_by_failure"].includes(s)) return "wev-pill--bad";
  if (s.startsWith("paused")) return "wev-pill--warn";
  return "wev-pill--neutral";
};

async function fetchExecutions(state) {
  const query = new URLSearchParams({
    automation_id: state.automationId,
    size: "25",
  });
  const queryValue = statusFilterQueryValue(state.status);
  if (queryValue) query.set("status", queryValue);
  if (state.cursor) query.set("cursor", state.cursor);

  const [data, error] = await this.getWithErrors(`/automation2/automation-execution?${query.toString()}`);
  return [data, error ? (typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))) : null];
}

function renderExecutions(state, data, loadError) {
  const rows = data?.results ?? [];

  const knownCount = (status) => {
    if (status === "active") return state.active;
    if (status === "paused") return state.paused;
    if (status === "completed") return state.completed;
    return undefined;
  };

  const filters = `
    <div class="wev-filters">
      ${STATUS_OPTIONS.map((status) => {
        const queryValue = statusFilterQueryValue(status);
        const isActive = state.status === status;
        const label = status ? humanizeKey(status) : "All";
        const count = knownCount(status);
        const badge = count !== undefined && count !== null ? ` (${count})` : "";
        return `
          <form class="wev-inline-form" data-script="filterStatus">
            <input type="hidden" name="automationId" value="${escapeHtml(state.automationId)}" />
            <input type="hidden" name="automationName" value="${escapeHtml(state.automationName)}" />
            <input type="hidden" name="active" value="${state.active}" />
            <input type="hidden" name="paused" value="${state.paused}" />
            <input type="hidden" name="completed" value="${state.completed}" />
            <input type="hidden" name="status" value="${escapeHtml(status)}" />
            <button type="submit" class="wev-filter-pill${isActive ? " wev-filter-pill--active" : ""}">${escapeHtml(label + badge)}</button>
          </form>
        `;
      }).join("")}
    </div>
  `;

  let body;
  if (loadError) {
    body = `<div class="wev-error">Couldn't load executions: ${escapeHtml(loadError)}</div>`;
  } else if (rows.length === 0) {
    body = `<div class="wev-empty">No executions found${state.status ? ` with status "${escapeHtml(humanizeKey(state.status))}"` : ""}.</div>`;
  } else {
    const thead = `<tr><th>Status</th><th>Trigger</th><th>Record</th><th>Started</th><th>Completed</th><th>Paused On</th><th></th></tr>`;
    const tbody = rows
      .map((row) => {
        const trigger = row.trigger?.type ? humanizeKey(row.trigger.type) : "—";
        const record = row.record ? escapeHtml(row.record.display_name ?? row.record.name ?? "—") : "—";
        const pausedOn = row.paused_on_step?.label ? escapeHtml(row.paused_on_step.label) : "—";
        return `
          <tr>
            <td><span class="wev-pill ${executionStatusClass(row.status)}">${escapeHtml(humanizeKey(row.status || "—"))}</span></td>
            <td>${escapeHtml(trigger)}</td>
            <td>${record}</td>
            <td>${formatDate(row.start_time)}</td>
            <td>${row.completed ? formatDate(row.completed) : "—"}</td>
            <td>${pausedOn}</td>
            <td>
              <form class="wev-inline-form" data-script="viewExecution">
                <input type="hidden" name="executionId" value="${escapeHtml(String(row.id ?? ""))}" />
                <button type="submit" class="wev-btn wev-btn--small">View</button>
              </form>
            </td>
          </tr>
        `;
      })
      .join("");
    body = `<div class="wev-table-scroll"><table class="wev-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
  }

  const pager = loadError
    ? ""
    : `
      <div class="wev-pager">
        <span class="wev-pager-info">${rows.length} shown this page</span>
        <div class="wev-pager-actions">
          <form class="wev-inline-form" data-script="paginate">
            <input type="hidden" name="automationId" value="${escapeHtml(state.automationId)}" />
            <input type="hidden" name="automationName" value="${escapeHtml(state.automationName)}" />
            <input type="hidden" name="active" value="${state.active}" />
            <input type="hidden" name="paused" value="${state.paused}" />
            <input type="hidden" name="completed" value="${state.completed}" />
            <input type="hidden" name="status" value="${escapeHtml(state.status)}" />
            <input type="hidden" name="cursor" value="${escapeHtml(data?.prev_cursor ?? "")}" />
            <button type="submit" class="wev-btn wev-btn--small" ${data?.prev_cursor ? "" : "disabled"}>← Prev</button>
          </form>
          <form class="wev-inline-form" data-script="paginate">
            <input type="hidden" name="automationId" value="${escapeHtml(state.automationId)}" />
            <input type="hidden" name="automationName" value="${escapeHtml(state.automationName)}" />
            <input type="hidden" name="active" value="${state.active}" />
            <input type="hidden" name="paused" value="${state.paused}" />
            <input type="hidden" name="completed" value="${state.completed}" />
            <input type="hidden" name="status" value="${escapeHtml(state.status)}" />
            <input type="hidden" name="cursor" value="${escapeHtml(data?.next_cursor ?? "")}" />
            <button type="submit" class="wev-btn wev-btn--small" ${data?.next_cursor ? "" : "disabled"}>Next →</button>
          </form>
        </div>
      </div>
    `;

  return `
    <div class="wev-body">
      ${filters}
      ${body}
      ${pager}
    </div>
  `;
}

function stateFromFormData(formData, fallback) {
  const first = (key, dflt = "") => formData[key]?.[0] ?? dflt;
  return {
    automationId: first("automationId", fallback?.automationId ?? ""),
    automationName: first("automationName", fallback?.automationName ?? ""),
    active: Number(first("active", fallback?.active ?? 0)) || 0,
    paused: Number(first("paused", fallback?.paused ?? 0)) || 0,
    completed: Number(first("completed", fallback?.completed ?? 0)) || 0,
    status: first("status", fallback?.status ?? ""),
    cursor: first("cursor", ""),
  };
}

const formData = this.args?.formData ?? {};
const state = stateFromFormData(formData);
const [data, error] = await fetchExecutions.call(this, state);
this.outputUI(renderExecutions(state, data, error));
