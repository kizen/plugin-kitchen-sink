// Kitchen Sink App · View · Object Records View
//
// Opened by My Objects Block's viewRecords event script, which forwards { objectId, objectType,
// objectName } through showViewInModal's args (read here on this.args, same as summaryView).
// Display-only: fetches the first page of that object's entity records directly via the base
// REST API and renders them as a table. No form, no event scripts.
//
// NOTE ON GROUND TRUTH: the entity-records search endpoint's request/response shape here is
// best-effort from documentation — POST /custom-objects/{id}/entity-records for standard objects,
// POST /pipelines/{id}/entity-records for pipeline objects — not verified against a live
// environment. Confirm the exact pagination body fields and response shape with `GET /docs/schema`
// before relying on this beyond a demo.

const { objectId, objectType, objectName } = this.args ?? {};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

if (!objectId) {
  this.outputUI(`
    <div class="orv-body">
      <p class="orv-empty">No object was selected.</p>
    </div>
  `);
} else {
  const path =
    objectType === "pipeline"
      ? `/pipelines/${objectId}/entity-records`
      : `/custom-objects/${objectId}/entity-records`;

  const [response, error] = await this.postWithErrors(path, { page: 1, size: 25 });

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
    const records = Array.isArray(response) ? response : (response?.results ?? []);

    const rows = records
      .map((record) => {
        // Field shapes vary by object; fall back through the common display keys.
        const label =
          record.display_name ?? record.name ?? record.title ?? record.id ?? JSON.stringify(record);
        return `<tr><td>${escapeHtml(label)}</td></tr>`;
      })
      .join("");

    this.outputUI(`
      <div class="orv-body">
        <p class="orv-intro">
          First ${records.length} record${records.length === 1 ? "" : "s"} of
          <strong>${escapeHtml(objectName ?? objectId)}</strong>.
        </p>
        <table class="orv-table">
          <tbody>
            ${rows || `<tr><td class="orv-empty">No records found.</td></tr>`}
          </tbody>
        </table>
      </div>
    `);
  }
}
