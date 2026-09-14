// Kitchen Sink App · Block · My Objects Block
//
// Blocks only get the BASE worker context — no `objectId`/`entityId`, no `getEntity` or
// `getObjectDetail` (those are record-detail-only, see recordDataExplorer). Listing the
// business's custom objects means hitting the raw Kizen REST API directly with
// `this.getWithErrors()`/`this.postWithErrors()`: `GET /custom-objects` (page-paginated) for the
// object list, then one `POST .../entity-records` per object for its record count. Each object
// reports an `object_type` of "standard" or "pipeline" — that distinction picks which
// entity-records endpoint family applies (`/custom-objects/{id}/entity-records` vs
// `/pipelines/{id}/entity-records`).
//
// Clicking a row opens the `objectRecordsView` view in a modal via `showViewInModal`. Each row is
// its own `<form data-script="viewRecords">` with hidden inputs carrying that object's id/type/
// name — a plain button click only ever dispatches with the block's fixed `args`, but a form
// submit's FormData rides along as `args.formData`, which is how a single event script tells rows
// apart.
//
// NOTE ON GROUND TRUTH: the entity-records request/response shape here (pagination body fields,
// count field name) is best-effort from documentation, not verified against a live environment.
// Confirm it with `GET /docs/schema` against your target environment before relying on the counts
// or record view beyond this demo.

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

// Cap how many objects we show/count so a business with a huge object list doesn't fire off
// dozens of concurrent count requests.
const MAX_OBJECTS = 12;

const entityRecordsPath = (object) =>
  object.object_type === "pipeline"
    ? `/pipelines/${object.id}/entity-records`
    : `/custom-objects/${object.id}/entity-records`;

// Best-effort record count: asks for a single row and reads whatever count-like field comes
// back. Returns null (rendered as "—") rather than throwing if the shape doesn't match.
const getRecordCount = async (object) => {
  const [response, error] = await this.postWithErrors(entityRecordsPath(object), {
    page: 1,
    size: 1,
  });

  if (error) return null;

  return (
    response?.count ??
    response?.total ??
    (Array.isArray(response?.results) ? response.results.length : null) ??
    (Array.isArray(response) ? response.length : null)
  );
};

const renderList = (objects, counts) => `
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge">MY OBJECTS</span>
      <span class="ks-block__title">My Objects Block</span>
    </div>
    <p class="ks-block__desc">
      This business's custom objects, from <code>GET /custom-objects</code>. Click one to view its
      records.
    </p>
    ${
      objects.length === 0
        ? `<p class="ks-block__desc">No custom objects found.</p>`
        : `<ul class="ks-block__list">
            ${objects
              .map((object, i) => {
                const objectId = String(object.id ?? "");
                const objectType = object.object_type ?? "standard";
                const objectName = object.name ?? object.api_name ?? "Unnamed";
                const count = counts[i];

                return `
                  <li>
                    <form class="ks-block__list-form" data-script="viewRecords">
                      <input type="hidden" name="objectId" value="${escapeHtml(objectId)}" />
                      <input type="hidden" name="objectType" value="${escapeHtml(objectType)}" />
                      <input type="hidden" name="objectName" value="${escapeHtml(objectName)}" />
                      <button type="submit" class="ks-block__list-item">
                        <span class="ks-block__list-name">${escapeHtml(objectName)}</span>
                        <span class="ks-block__list-meta">
                          ${escapeHtml(object.api_name ?? "")} · ${escapeHtml(objectType)} ·
                          ${count == null ? "—" : escapeHtml(count)} record${count === 1 ? "" : "s"}
                        </span>
                      </button>
                    </form>
                  </li>
                `;
              })
              .join("")}
          </ul>`
    }
    <div class="ks-block__actions">
      <button class="ks-block__btn" data-script="refresh">Refresh</button>
    </div>
  </div>
`;

const [response, error] = await this.getWithErrors("/custom-objects");

if (error) {
  this.outputUI(`
    <div class="ks-block">
      <div class="ks-block__header">
        <span class="ks-block__badge ks-block__badge--error">MY OBJECTS</span>
        <span class="ks-block__title">My Objects Block</span>
      </div>
      <p class="ks-block__desc">Couldn't load custom objects: ${escapeHtml(
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error)),
      )}</p>
      <div class="ks-block__actions">
        <button class="ks-block__btn" data-script="refresh">Retry</button>
      </div>
    </div>
  `);
} else {
  // Defensive: some list endpoints wrap results in { results: [...] }, others return a bare array.
  const allObjects = Array.isArray(response) ? response : (response?.results ?? []);
  const objects = allObjects.slice(0, MAX_OBJECTS);
  const counts = await Promise.all(objects.map((object) => getRecordCount(object)));

  this.outputUI(renderList(objects, counts));
}
