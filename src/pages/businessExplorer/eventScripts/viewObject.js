// Kitchen Sink App · Page · Business Explorer · viewObject
//
// Fired by a row's "View" form submit. Fetches the object's full detail (GET /custom-objects/{id}
// — the same unified detail shape the list rows are a summary of) and forwards it as-is to
// customObjectDetailView via showViewInModal, so the view doesn't need to re-fetch.

const formData = this.args?.formData ?? {};
const objectId = formData.itemId?.[0];

if (!objectId) {
  this.showToast("No object selected.", { variant: "failure" });
} else {
  const [object, error] = await this.getWithErrors(
    `/custom-objects/${encodeURIComponent(objectId)}`,
  );

  if (error) {
    this.showToast(
      `Couldn't load object detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    await this.showViewInModal("customobjectdetailview", {
      args: { object },
      options: {
        title: object?.name ?? object?.entity_name ?? "Custom Object",
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
