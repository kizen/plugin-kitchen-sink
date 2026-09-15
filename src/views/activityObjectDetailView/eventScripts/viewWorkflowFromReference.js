// Kitchen Sink App · View · Activity Object Detail View · viewWorkflowFromReference
//
// Fired by clicking an Automation title under References. Fetches that automation's detail and
// opens workflowDetailView — the same view Business Explorer's Agentic Workflows tab uses — on
// top of this one, a nested modal-in-a-modal. Identical shape to Business Explorer's viewWorkflow
// event script, duplicated here since there's no shared module system across data-script files.

const formData = this.args?.formData ?? {};
const automationId = formData.automationId?.[0];

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
