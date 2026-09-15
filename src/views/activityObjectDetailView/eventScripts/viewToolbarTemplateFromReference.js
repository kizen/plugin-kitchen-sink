// Kitchen Sink App · View · Activity Object Detail View · viewToolbarTemplateFromReference
//
// Fired by clicking a Toolbar Template title under References. Fetches its detail and opens
// toolbarTemplateDetailView on top of this one.

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
