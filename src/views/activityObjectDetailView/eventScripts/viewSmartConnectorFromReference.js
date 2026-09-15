// Kitchen Sink App · View · Activity Object Detail View · viewSmartConnectorFromReference
//
// Fired by clicking a Smart Connector title under References. Fetches its detail and opens
// smartConnectorDetailView on top of this one.

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
