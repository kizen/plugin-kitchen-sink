// Kitchen Sink App · View · Activity Object Detail View · viewSmartConnectorFromReference
//
// Fired by clicking a Smart Connector title under References. Fetches its detail and opens
// smartConnectorDetailView.
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const smartConnectorId = formData.smartConnectorId?.[0];

if (!smartConnectorId) {
  this.showToast("No Smart Connector selected.", { variant: "failure" });
} else {
  const [smartConnector, error] = await this.getWithErrors(
    `/smart-connectors/${encodeURIComponent(smartConnectorId)}`,
  );

  if (error) {
    this.showToast(
      `Couldn't load Smart Connector detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    this.closeModal(undefined, true);

    await this.showViewInModal("smartconnectordetailview", {
      args: { smartConnector },
      options: {
        title: smartConnector?.name ?? "Smart Connector",
        size: "large",
        cancelButton: { label: "Close" },
      },
    });
  }
}
