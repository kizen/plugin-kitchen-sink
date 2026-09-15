// Kitchen Sink App · View · Custom Object Detail View · viewRecords
//
// Fired by the "# Records" form submit. Opens objectRecordsView — the same view My Objects
// Block uses — on top of this one, a nested modal-in-a-modal.

const formData = this.args?.formData ?? {};
const objectId = formData.objectId?.[0];
const objectType = formData.objectType?.[0];
const objectName = formData.objectName?.[0];

if (!objectId) {
  this.showToast("No object selected.", { variant: "failure" });
} else {
  await this.showViewInModal("objectrecordsview", {
    args: { objectId, objectType, objectName },
    options: {
      title: `${objectName} records`,
      size: "large",
      cancelButton: { label: "Close" },
    },
  });
}
