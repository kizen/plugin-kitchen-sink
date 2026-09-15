// Kitchen Sink App · View · Custom Object Detail View · viewRecords
//
// Fired by the "# Records" form submit. Opens objectRecordsView — the same view My Objects
// Block uses.
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const objectId = formData.objectId?.[0];
const objectType = formData.objectType?.[0];
const objectName = formData.objectName?.[0];

if (!objectId) {
  this.showToast("No object selected.", { variant: "failure" });
} else {
  this.closeModal(undefined, true);

  await this.showViewInModal("objectrecordsview", {
    args: { objectId, objectType, objectName },
    options: {
      title: `${objectName} records`,
      size: "large",
      cancelButton: { label: "Close" },
    },
  });
}
