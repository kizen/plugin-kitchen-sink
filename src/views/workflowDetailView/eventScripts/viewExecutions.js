// Kitchen Sink App · View · Workflow Detail View · viewExecutions
//
// Fired by the Executions row's form submit. Opens workflowExecutionsView in a modal, forwarding
// the automation's id/name and its own summary counts (active/paused/completed) so that view can
// show filter-pill badges without an extra fetch.
//
// IMPORTANT: showViewInModal calls chain SEQUENTIALLY (see toolbarItems/modalLauncher) — the
// caller awaits one, it resolves once that modal closes, only then does the next open. Calling
// showViewInModal from inside a View's own event script while that View's own modal is still
// open (its outer showViewInModal promise still pending) stacks a second modal on top instead of
// chaining, which hangs the UI. closeModal() first resolves the outer promise, so this open
// happens after, not nested inside it.

const formData = this.args?.formData ?? {};
const automationId = formData.automationId?.[0];
const automationName = formData.automationName?.[0];
const active = formData.active?.[0] ?? "0";
const paused = formData.paused?.[0] ?? "0";
const completed = formData.completed?.[0] ?? "0";

if (!automationId) {
  this.showToast("No workflow selected.", { variant: "failure" });
} else {
  this.closeModal(undefined, true);

  await this.showViewInModal("workflowexecutionsview", {
    args: { automationId, automationName, active, paused, completed },
    options: {
      title: `${automationName} — Executions`,
      size: "large",
      cancelButton: { label: "Close" },
    },
  });
}
