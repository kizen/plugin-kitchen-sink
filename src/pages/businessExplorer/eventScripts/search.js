// Kitchen Sink App · Page · Business Explorer · search
//
// Fired by the search/ordering <form data-script="search"> submit, for whichever tab is active
// (carried in a hidden "tab" input). See script.js for the shared core this duplicates — each
// data-script file is its own fresh worker, so there's no shared module to import.

// Shared core logic for Business Explorer, duplicated across script.js / eventScripts/search.js /
// eventScripts/paginate.js / eventScripts/switchTab.js — each data-script dispatch is its own
// fresh worker with no shared module system, so every file below copies this whole block. See
// dashboardBlock's refresh.js / myObjectsBlock's refresh.js for the same pattern already
// established in this repo.

const PAGE_SIZE = 20;
// Activity Objects has no list endpoint for its definitions (per the Kizen API) — it's derived by
// paging through recent scheduled activities and grouping by activity_object. Capped to bound how
// many requests one dispatch fires.
const ACTIVITY_OBJECT_SAMPLE_PAGES = 5;
const ACTIVITY_OBJECT_PAGE_SIZE = 100;

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

const pill = (label) => `<span class="be-pill">${escapeHtml(label)}</span>`;

const compareValues = (a, b) => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
};

// Tab definitions — label, how to fetch, columns to render, and (if any) which event script a
// row's "View" button dispatches to. "aggregate" tabs (activityObjects) are fetched/filtered/
// sorted entirely client-side rather than via server search/ordering/pagination.
const TAB_CONFIG = {
  objects: {
    label: "Custom Objects",
    path: "/custom-objects",
    searchParam: "search",
    orderingOptions: [
      { value: "name", label: "Name" },
      { value: "object_type", label: "Type" },
      { value: "created", label: "Created" },
    ],
    defaultOrderingKey: "name",
    defaultOrderingDir: "asc",
    detailScript: "viewObject",
    columns: [
      { label: "Name", render: (row) => escapeHtml(row.name ?? "—") },
      { label: "API Name", render: (row) => `<code>${escapeHtml(row.object_name ?? "—")}</code>` },
      { label: "Type", render: (row) => pill(row.object_type ?? "—") },
      { label: "Custom?", render: (row) => (row.is_custom ? "Yes" : "No") },
      {
        label: "Owner",
        render: (row) => escapeHtml(row.owner?.full_name ?? row.owner?.display_name ?? "—"),
      },
      { label: "Created", render: (row) => formatDate(row.created) },
    ],
  },
  activities: {
    label: "Activities",
    path: "/activities/scheduled-activity",
    searchParam: "search",
    orderingOptions: [
      { value: "due_datetime", label: "Due date" },
      { value: "completed_at", label: "Completed date" },
    ],
    defaultOrderingKey: "due_datetime",
    defaultOrderingDir: "desc",
    columns: [
      {
        label: "Activity Object",
        render: (row) => {
          const v = row.activity_object;
          return escapeHtml(v && typeof v === "object" ? (v.name ?? v.api_name ?? "—") : (v ?? "—"));
        },
      },
      { label: "Note", render: (row) => escapeHtml(truncate(row.note, 60)) },
      {
        label: "Employee",
        render: (row) => {
          const v = row.employee;
          return escapeHtml(
            v && typeof v === "object" ? (v.display_name ?? v.full_name ?? v.name ?? "—") : (v ?? "—"),
          );
        },
      },
      { label: "Due", render: (row) => formatDate(row.due_datetime) },
      { label: "Status", render: (row) => (row.completed_at ? pill("Completed") : pill("Scheduled")) },
      {
        label: "Associated Entities",
        render: (row) =>
          Array.isArray(row.associated_entities) && row.associated_entities.length
            ? row.associated_entities
                .map((e) => escapeHtml(e.entity?.display_name ?? e.entity?.name ?? "—"))
                .join(", ")
            : "—",
      },
    ],
  },
  activityObjects: {
    label: "Activity Objects",
    aggregate: true,
    orderingOptions: [
      { value: "count", label: "# Activities" },
      { value: "name", label: "Activity Type" },
      { value: "completed", label: "Completed" },
      { value: "scheduled", label: "Scheduled" },
      { value: "latest_due", label: "Most recent due" },
    ],
    defaultOrderingKey: "count",
    defaultOrderingDir: "desc",
    detailScript: "viewActivityObject",
    columns: [
      { label: "Activity Type", render: (row) => escapeHtml(row.name ?? "—") },
      { label: "# Activities", render: (row) => String(row.count ?? 0) },
      { label: "Completed", render: (row) => String(row.completed ?? 0) },
      { label: "Scheduled", render: (row) => String(row.scheduled ?? 0) },
      { label: "Most Recent Due", render: (row) => formatDate(row.latest_due) },
    ],
  },
  workflows: {
    label: "Agentic Workflows",
    path: "/automation2/automations",
    searchParam: "search",
    orderingOptions: [
      { value: "name", label: "Name" },
      { value: "active", label: "Status" },
      { value: "created", label: "Created" },
    ],
    defaultOrderingKey: "created",
    defaultOrderingDir: "desc",
    detailScript: "viewWorkflow",
    columns: [
      { label: "Name", render: (row) => escapeHtml(row.name ?? "—") },
      {
        label: "Type",
        render: (row) => pill(row.type === "global" ? "Global" : "Record-Based"),
      },
      { label: "Status", render: (row) => (row.active ? pill("Active") : pill("Inactive")) },
      { label: "Object", render: (row) => escapeHtml(row.custom_object?.name ?? "—") },
      { label: "AI Description", render: (row) => escapeHtml(truncate(row.ai_description, 80)) },
      {
        label: "Executions (A / P / D)",
        render: (row) => `${row.number_active ?? 0} / ${row.number_paused ?? 0} / ${row.number_completed ?? 0}`,
      },
      { label: "Created", render: (row) => formatDate(row.created) },
    ],
  },
};

const TAB_ORDER = ["objects", "activities", "activityObjects", "workflows"];

// Fetches one tab's data given the current state. Aggregate tabs (activityObjects) sample up to
// ACTIVITY_OBJECT_SAMPLE_PAGES pages of scheduled activities and group/filter/sort them
// client-side; list tabs are ordinary server-paginated GETs.
async function fetchTabData(state) {
  const cfg = TAB_CONFIG[state.tab];

  if (cfg.aggregate) {
    let page = 1;
    let rows = [];
    let totalCount = 0;

    while (page <= ACTIVITY_OBJECT_SAMPLE_PAGES) {
      const query = new URLSearchParams({
        page: String(page),
        page_size: String(ACTIVITY_OBJECT_PAGE_SIZE),
        ordering: "-due_datetime",
      });

      const [data, error] = await this.getWithErrors(
        `/activities/scheduled-activity?${query.toString()}`,
      );

      if (error) return [null, typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))];

      totalCount = data?.count ?? rows.length;
      rows = rows.concat(data?.results ?? []);
      if (!data?.next || rows.length >= totalCount) break;
      page++;
    }

    const byType = new Map();
    rows.forEach((row) => {
      const obj = row.activity_object;
      const name = obj && typeof obj === "object" ? (obj.name ?? obj.api_name ?? "—") : (obj ?? "—");
      const key = obj && typeof obj === "object" ? (obj.id ?? name) : name;
      if (!byType.has(key)) {
        byType.set(key, { id: key, name, count: 0, completed: 0, scheduled: 0, latest_due: null });
      }
      const entry = byType.get(key);
      entry.count++;
      if (row.completed_at) entry.completed++;
      else entry.scheduled++;
      if (row.due_datetime && (!entry.latest_due || row.due_datetime > entry.latest_due)) {
        entry.latest_due = row.due_datetime;
      }
    });

    let results = Array.from(byType.values());

    if (state.search) {
      const term = state.search.toLowerCase();
      results = results.filter((r) => String(r.name).toLowerCase().includes(term));
    }

    results.sort((a, b) => {
      const cmp = compareValues(a[state.orderingKey], b[state.orderingKey]);
      return state.orderingDir === "asc" ? cmp : -cmp;
    });

    return [{ results, count: results.length, next: null, previous: null, sampledCount: rows.length, totalCount }, null];
  }

  const ordering = `${state.orderingDir === "desc" ? "-" : ""}${state.orderingKey}`;
  const query = new URLSearchParams({
    page: String(state.page),
    page_size: String(PAGE_SIZE),
    ordering,
  });
  if (state.search) query.set(cfg.searchParam, state.search);

  const [data, error] = await this.getWithErrors(`${cfg.path}?${query.toString()}`);
  return [data, error ? (typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))) : null];
}

function renderExplorer(state, data, loadError) {
  const cfg = TAB_CONFIG[state.tab];
  const rows = data?.results ?? [];
  const count = data?.count ?? rows.length;
  const totalPages = cfg.aggregate ? 1 : Math.max(1, Math.ceil(count / PAGE_SIZE));

  const tabBar = `
    <nav class="be-tabs">
      ${TAB_ORDER.map((tabKey) => {
        const tCfg = TAB_CONFIG[tabKey];
        return `
          <form class="be-inline-form" data-script="switchTab">
            <input type="hidden" name="tab" value="${tabKey}" />
            <button type="submit" class="be-tab${tabKey === state.tab ? " be-tab--active" : ""}">${escapeHtml(tCfg.label)}</button>
          </form>
        `;
      }).join("")}
    </nav>
  `;

  const orderingOptionsHtml = cfg.orderingOptions
    .map(
      (o) =>
        `<option value="${o.value}" ${state.orderingKey === o.value ? "selected" : ""}>${escapeHtml(o.label)}</option>`,
    )
    .join("");

  const controls = `
    <form class="be-controls" data-script="search">
      <input type="hidden" name="tab" value="${state.tab}" />
      <input type="hidden" name="page" value="1" />
      <input
        class="be-input"
        type="text"
        name="search"
        value="${escapeHtml(state.search)}"
        placeholder="Search ${escapeHtml(cfg.label.toLowerCase())}…"
      />
      <select class="be-select" name="orderingKey">${orderingOptionsHtml}</select>
      <select class="be-select" name="orderingDir">
        <option value="asc" ${state.orderingDir === "asc" ? "selected" : ""}>Ascending</option>
        <option value="desc" ${state.orderingDir === "desc" ? "selected" : ""}>Descending</option>
      </select>
      <button type="submit" class="be-btn">Search</button>
    </form>
  `;

  let body;

  if (loadError) {
    body = `<div class="be-error">Couldn't load ${escapeHtml(cfg.label.toLowerCase())}: ${escapeHtml(loadError)}</div>`;
  } else if (rows.length === 0) {
    body = `<div class="be-empty">No ${escapeHtml(cfg.label.toLowerCase())} found${state.search ? ` for "${escapeHtml(state.search)}"` : ""}.</div>`;
  } else {
    const thead = `<tr>${cfg.columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("")}${cfg.detailScript ? '<th class="be-table-actions"></th>' : ""}</tr>`;

    const tbody = rows
      .map((row) => {
        const cells = cfg.columns.map((c) => `<td>${c.render(row)}</td>`).join("");
        const actionCell = cfg.detailScript
          ? `
            <td class="be-table-actions">
              <form class="be-inline-form" data-script="${cfg.detailScript}">
                <!-- Field is "itemId", not "id": DOMPurify's clobbering protection strips any
                     name/id attribute whose VALUE collides with a form-element property
                     (id, name, action, method, title, length, ...) — see appPage/script.js. -->
                <input type="hidden" name="itemId" value="${escapeHtml(String(row.id ?? ""))}" />
                <button type="submit" class="be-btn be-btn--small">View</button>
              </form>
            </td>
          `
          : "";
        return `<tr>${cells}${actionCell}</tr>`;
      })
      .join("");

    body = `<div class="be-table-scroll"><table class="be-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;

    if (cfg.aggregate && data) {
      const note =
        data.sampledCount < data.totalCount
          ? `Based on the ${data.sampledCount} most recent of ${data.totalCount} total activities (sample capped for performance).`
          : `Based on all ${data.totalCount} activities.`;
      body += `<p class="be-hint">${escapeHtml(note)}</p>`;
    }
  }

  const pager =
    loadError || cfg.aggregate
      ? ""
      : `
      <div class="be-pager">
        <span class="be-pager-info">Page ${state.page} of ${totalPages} · ${count} total</span>
        <div class="be-pager-actions">
          <form class="be-inline-form" data-script="paginate">
            <input type="hidden" name="tab" value="${state.tab}" />
            <input type="hidden" name="search" value="${escapeHtml(state.search)}" />
            <input type="hidden" name="orderingKey" value="${escapeHtml(state.orderingKey)}" />
            <input type="hidden" name="orderingDir" value="${escapeHtml(state.orderingDir)}" />
            <input type="hidden" name="page" value="${state.page - 1}" />
            <button type="submit" class="be-btn be-btn--small" ${state.page <= 1 ? "disabled" : ""}>← Prev</button>
          </form>
          <form class="be-inline-form" data-script="paginate">
            <input type="hidden" name="tab" value="${state.tab}" />
            <input type="hidden" name="search" value="${escapeHtml(state.search)}" />
            <input type="hidden" name="orderingKey" value="${escapeHtml(state.orderingKey)}" />
            <input type="hidden" name="orderingDir" value="${escapeHtml(state.orderingDir)}" />
            <input type="hidden" name="page" value="${state.page + 1}" />
            <button type="submit" class="be-btn be-btn--small" ${!data?.next ? "disabled" : ""}>Next →</button>
          </form>
        </div>
      </div>
    `;

  return `
    <div class="be-page">
      <header class="be-header">
        <h1>Business Explorer</h1>
        <p class="be-muted">Live data for this business, read directly from the Kizen REST API.</p>
      </header>
      ${tabBar}
      ${controls}
      ${body}
      ${pager}
    </div>
  `;
}

function stateFromFormData(formData) {
  const first = (key, fallback = "") => formData[key]?.[0] ?? fallback;
  const tab = first("tab", "objects");
  const cfg = TAB_CONFIG[tab] ?? TAB_CONFIG.objects;

  return {
    tab: TAB_CONFIG[tab] ? tab : "objects",
    search: first("search"),
    orderingKey: first("orderingKey", cfg.defaultOrderingKey),
    orderingDir: first("orderingDir", cfg.defaultOrderingDir),
    page: Math.max(1, parseInt(first("page", "1"), 10) || 1),
  };
}

const formData = this.args?.formData ?? {};
const state = stateFromFormData(formData);
const [data, error] = await fetchTabData.call(this, state);
this.outputUI(renderExplorer(state, data, error));
