// Kitchen Sink App · View · Workflow Detail View · viewExecutions
//
// Fired by the Executions row's form submit. Opens workflowExecutionsView in a modal, forwarding
// the automation's id/name and its own summary counts (active/paused/completed) so that view can
// show filter-pill badges without an extra fetch. A view opening another view in a modal while
// already inside one is the same showViewInModal primitive every other worker context uses —
// nothing view-specific stops it from nesting.

const formData = this.args?.formData ?? {};
const automationId = formData.automationId?.[0];
const automationName = formData.automationName?.[0];
const active = formData.active?.[0] ?? "0";
const paused = formData.paused?.[0] ?? "0";
const completed = formData.completed?.[0] ?? "0";

if (!automationId) {
  this.showToast("No workflow selected.", { variant: "failure" });
} else {
  await this.showViewInModal("workflowexecutionsview", {
    args: { automationId, automationName, active, paused, completed },
    options: {
      title: `${automationName} — Executions`,
      size: "large",
      cancelButton: { label: "Close" },
    },
  });
}
