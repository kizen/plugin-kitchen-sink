// Kitchen Sink App · View · Object Records View
//
// Opened by My Objects Block's viewRecords event script (and now also Custom Object Detail
// View's "# Records" link), which forward { objectId, objectType, objectName } through
// showViewInModal's args. Fetches the first page of that object's entity records directly via
// the base REST API and renders them as a table. Display-only: no search/sort/pagination
// controls (unlike Business Explorer's tabs), since this view has no event scripts of its own.
//
// entity-records is a POST whose pagination (page, page_size, ordering, search) rides on the
// query string, not the body — the body is the filter payload, {} for "all records". Confirmed
// against a working reference implementation (a standalone SPA hitting the same live endpoint).

const { objectId, objectType, objectName } = this.args ?? {};

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

if (!objectId) {
  this.outputUI(`
    <div class="orv-body">
      <p class="orv-empty">No object was selected.</p>
    </div>
  `);
} else {
  const path =
    objectType === "pipeline" ? `/pipelines/${objectId}/entity-records` : `/custom-objects/${objectId}/entity-records`;

  const query = new URLSearchParams({ page: "1", page_size: "25", ordering: "-created" });
  const [response, error] = await this.postWithErrors(`${path}?${query.toString()}`, {});

  if (error) {
    this.outputUI(`
      <div class="orv-body">
        <p class="orv-error">
          Couldn't load records for ${escapeHtml(objectName ?? objectId)}:
          ${escapeHtml(typeof error === "string" ? error : (error?.message ?? JSON.stringify(error)))}
        </p>
      </div>
    `);
  } else {
    const records = response?.results ?? [];
    const isPipeline = objectType === "pipeline";

    const thead = `
      <tr>
        <th>Name</th>
        <th>Owner</th>
        <th>Value</th>
        ${isPipeline ? "<th>Stage</th>" : ""}
        <th>Created</th>
        <th>Updated</th>
      </tr>
    `;

    const rows = records
      .map((record) => {
        const owner = record.owner ? escapeHtml(record.owner.full_name ?? record.owner.display_name ?? "—") : "—";
        const value =
          record.entity_value?.amount != null
            ? `${escapeHtml(record.entity_value.symbol ?? "")}${escapeHtml(record.entity_value.amount)}`
            : "—";
        const stageCell = isPipeline ? `<td>${record.stage ? escapeHtml(record.stage.name ?? "—") : "—"}</td>` : "";
        return `
          <tr>
            <td>${escapeHtml(record.display_name ?? record.name ?? "—")}</td>
            <td>${owner}</td>
            <td>${value}</td>
            ${stageCell}
            <td>${formatDate(record.created)}</td>
            <td>${formatDate(record.updated)}</td>
          </tr>
        `;
      })
      .join("");

    this.outputUI(`
      <div class="orv-body">
        <p class="orv-intro">
          First ${records.length} of ${response?.count ?? records.length} record${(response?.count ?? records.length) === 1 ? "" : "s"} of
          <strong>${escapeHtml(objectName ?? objectId)}</strong>.
        </p>
        ${
          records.length
            ? `<div class="orv-table-scroll"><table class="orv-table"><thead>${thead}</thead><tbody>${rows}</tbody></table></div>`
            : `<p class="orv-empty">No records found.</p>`
        }
      </div>
    `);
  }
}
