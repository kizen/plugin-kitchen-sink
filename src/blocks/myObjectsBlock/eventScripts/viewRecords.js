// Kitchen Sink App · Block · My Objects Block · viewRecords
//
// Dispatched by a row's <form data-script="viewRecords"> submit — the engine collects that form's
// FormData and passes it as args.formData (FormData.getAll semantics: every value is an array,
// even for a single hidden input). Opens the objectRecordsView view in a modal, forwarding the
// clicked object's id/type/name through showViewInModal's args.

const formData = this.args?.formData ?? {};

const objectId = formData.objectId?.[0];
const objectType = formData.objectType?.[0];
const objectName = formData.objectName?.[0];

if (!objectId) {
  this.showToast("No object selected.", { variant: "failure" });
  return;
}

await this.showViewInModal("objectrecordsview", {
  args: { objectId, objectType, objectName },
  options: {
    title: `${objectName} records`,
    size: "large",
    cancelButton: { label: "Close" },
  },
});
