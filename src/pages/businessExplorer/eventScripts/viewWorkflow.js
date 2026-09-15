// Kitchen Sink App · Page · Business Explorer · viewWorkflow
//
// Fired by a row's "View" form submit on the Agentic Workflows tab. Fetches the automation's full
// detail (GET /automation2/automations/{id}) and forwards it to workflowDetailView.

const formData = this.args?.formData ?? {};
const automationId = formData.id?.[0];

if (!automationId) {
  this.showToast("No workflow selected.", { variant: "failure" });
} else {
  const [automation, error] = await this.getWithErrors(
    `/automation2/automations/${encodeURIComponent(automationId)}`,
  );

  if (error) {
    this.showToast(
      `Couldn't load workflow detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    await this.showViewInModal("workflowdetailview", {
      args: { automation },
      options: {
        title: automation?.name ?? "Agentic Workflow",
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
