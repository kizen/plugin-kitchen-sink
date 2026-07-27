// Kitchen Sink App · Block · Homepage Block · openView
//
// showViewInModal takes the view's api_name. The result shape
// is { canceled, values, eventSource }; submitted form data is at result.values.formData, where
// every field is an array (FormData.getAll semantics). A single input is a one-element array,
// but a multi-value field like formView's "channels" checkbox group carries every checked value.
// Join, rather than index, or you silently drop all but the first (this matches summaryView's handling
// of the same shared view). A block is a full worker context - the same showViewInModal contract
// the Modal Launcher toolbar item uses.

const result = await this.showViewInModal("formview", {
  options: {
    title: "Homepage Block form",
    confirmButton: { label: "Submit" },
    cancelButton: { label: "Cancel" },
    size: "medium",
  },
});

if (result.canceled) {
  this.showToast("Modal canceled — nothing submitted.", { variant: "alert" });
  return;
}

const formData = result.values.formData;

const flattened = Object.fromEntries(
  Object.entries(formData).map(([key, values]) => [
    key,
    values.filter((value) => value !== "").join(", "),
  ]),
);

this.console.log(
  "Homepage block — submitted form data:",
  JSON.stringify(flattened),
);

this.showToast("Form submitted — see the console for values.", {
  variant: "success",
});
