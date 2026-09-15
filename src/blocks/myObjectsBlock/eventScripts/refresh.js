// Kitchen Sink App · Block · My Objects Block · refresh
//
// Re-fetches /custom-objects (plus a per-object record count) and repaints the block in place via
// outputUI — each event-script run is its own fresh worker, so nothing is reused from the initial
// script.js run. See script.js for the endpoint/shape notes this mirrors.

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const MAX_OBJECTS = 12;

const entityRecordsPath = (object) =>
  object.object_type === "pipeline"
    ? `/pipelines/${object.id}/entity-records`
    : `/custom-objects/${object.id}/entity-records`;

const getRecordCount = async (object) => {
  const query = new URLSearchParams({ page: "1", page_size: "1", ordering: "-created" });
  const [response, error] = await this.postWithErrors(`${entityRecordsPath(object)}?${query.toString()}`, {});

  if (error) return null;

  return response?.count ?? (Array.isArray(response?.results) ? response.results.length : null);
};

const renderList = (objects, counts) => `
  <div class="ks-block">
    <div class="ks-block__header">
      <span class="ks-block__badge ks-block__badge--accent">REFRESHED</span>
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
  this.showToast(
    `Couldn't refresh custom objects: ${
      typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
    }`,
    { variant: "failure", autohide: false },
  );
} else {
  const allObjects = Array.isArray(response) ? response : (response?.results ?? []);
  const objects = allObjects.slice(0, MAX_OBJECTS);
  const counts = await Promise.all(objects.map((object) => getRecordCount(object)));

  this.outputUI(renderList(objects, counts));
}
