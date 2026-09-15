// Kitchen Sink App · View · Activity Object Detail View · viewToolbarTemplateFromReference
//
// Fired by clicking a Toolbar Template title under References. Fetches its detail and opens
// toolbarTemplateDetailView.
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const toolbarTemplateId = formData.toolbarTemplateId?.[0];

if (!toolbarTemplateId) {
  this.showToast("No toolbar template selected.", { variant: "failure" });
} else {
  const [toolbarTemplate, error] = await this.getWithErrors(
    `/toolbar-templates/${encodeURIComponent(toolbarTemplateId)}`,
  );

  if (error) {
    this.showToast(
      `Couldn't load toolbar template detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    this.closeModal(undefined, true);

    await this.showViewInModal("toolbartemplatedetailview", {
      args: { toolbarTemplate },
      options: {
        title: toolbarTemplate?.name ?? "Toolbar Template",
        size: "medium",
        cancelButton: { label: "Close" },
      },
    });
  }
}
