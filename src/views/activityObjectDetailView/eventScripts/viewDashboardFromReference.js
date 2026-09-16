// Kitchen Sink App · View · Activity Object Detail View · viewDashboardFromReference
//
// Fired by clicking a Dashboard or Homepage title under References — both reference types share
// the same GET /dashboards/{id} endpoint in the reference SPA, distinguished only by a "kind"
// hidden field for the title/empty-state text. Fetches the detail and opens dashboardDetailView.
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const dashboardId = formData.dashboardId?.[0];
const kind = formData.kind?.[0] ?? "Dashboard";

if (!dashboardId) {
  this.showToast(`No ${kind} selected.`, { variant: "failure" });
} else {
  const [dashboard, error] = await this.getWithErrors(`/dashboards/${encodeURIComponent(dashboardId)}`);

  if (error) {
    this.showToast(
      `Couldn't load ${kind} detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    this.closeModal(undefined, true);

    await this.showViewInModal("dashboarddetailview", {
      args: { dashboard, kind },
      options: {
        title: dashboard?.name ?? kind,
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
