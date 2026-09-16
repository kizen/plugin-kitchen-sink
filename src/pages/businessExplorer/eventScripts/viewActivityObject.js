// Kitchen Sink App · Page · Business Explorer · viewActivityObject
//
// Fired by a row's "View" form submit on the Activity Objects tab. The row itself is a
// client-side aggregate (see fetchTabData in script.js), but its id is the real Activity Object's
// id/api_name, so GET /activities/{id} and GET /activities/{id}/references both work directly.
// References is fetched best-effort — a failure there still lets the main detail render.

const formData = this.args?.formData ?? {};
const activityObjectId = formData.itemId?.[0];

if (!activityObjectId) {
  this.showToast("No activity object selected.", { variant: "failure" });
} else {
  const detailPath = `/activities/${encodeURIComponent(activityObjectId)}`;

  const [[obj, objError], [references, referencesError]] = await Promise.all([
    this.getWithErrors(detailPath),
    this.getWithErrors(`${detailPath}/references`),
  ]);

  if (objError) {
    this.showToast(
      `Couldn't load activity object detail: ${
        typeof objError === "string" ? objError : (objError?.message ?? JSON.stringify(objError))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    await this.showViewInModal("activityobjectdetailview", {
      args: {
        object: obj,
        references: referencesError ? null : references,
      },
      options: {
        title: obj?.name ?? "Activity Object",
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
