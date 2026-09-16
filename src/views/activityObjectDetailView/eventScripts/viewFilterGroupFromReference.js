// Kitchen Sink App · View · Activity Object Detail View · viewFilterGroupFromReference
//
// Fired by clicking a Filter Group title under References. Filter groups are scoped to their
// object (GET /custom-objects/{objectId}/filter-groups/{id}), so both ids ride along as hidden
// fields. Fetches the detail and opens filterGroupDetailView.
//
// closeModal() before opening the next view: see workflowDetailView/eventScripts/viewExecutions.js
// for why — showViewInModal calls must chain sequentially (one closes, then the next opens), not
// stack while the current View's own modal is still open, or the UI hangs.

const formData = this.args?.formData ?? {};
const objectId = formData.objectId?.[0];
const filterGroupId = formData.filterGroupId?.[0];

if (!objectId || !filterGroupId) {
  this.showToast("No filter group selected.", { variant: "failure" });
} else {
  const [filterGroup, error] = await this.getWithErrors(
    `/custom-objects/${encodeURIComponent(objectId)}/filter-groups/${encodeURIComponent(filterGroupId)}`,
  );

  if (error) {
    this.showToast(
      `Couldn't load filter group detail: ${
        typeof error === "string" ? error : (error?.message ?? JSON.stringify(error))
      }`,
      { variant: "failure", autohide: false },
    );
  } else {
    this.closeModal(undefined, true);

    await this.showViewInModal("filtergroupdetailview", {
      args: { filterGroup },
      options: {
        title: filterGroup?.name ?? "Filter Group",
        size: "medium",
        cancelButton: { label: "Close" },
      },
    });
  }
}
