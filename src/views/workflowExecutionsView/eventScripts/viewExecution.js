// Kitchen Sink App · View · Workflow Executions View · viewExecution
//
// Fired by a row's "View" form submit. Fetches the execution's detail, step history, and
// variables in parallel and forwards all three to executionDetailView — variables is fetched
// best-effort (its documented response schema looks unreliable; see executionDetailView for the
// normalization this feeds).
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const executionId = formData.executionId?.[0];

if (!executionId) {
  this.showToast("No execution selected.", { variant: "failure" });
} else {
  const base = `/automation2/automation-execution/${encodeURIComponent(executionId)}`;

  const [[execution, execError], [history, historyError], [variables, variablesError]] = await Promise.all([
    this.getWithErrors(base),
    this.getWithErrors(`${base}/history?page_size=100&ordering=created`),
    this.getWithErrors(`${base}/variables`),
  ]);

  if (execError) {
    this.showToast(
      `Couldn't load execution detail: ${
        typeof execError === "string" ? execError : (execError?.message ?? JSON.stringify(execError))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    this.closeModal(undefined, true);

    await this.showViewInModal("executiondetailview", {
      args: {
        execution,
        history: historyError ? null : history,
        variables: variablesError ? null : variables,
      },
      options: {
        title: "Execution Detail",
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
