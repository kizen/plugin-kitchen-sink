// Kitchen Sink App · Route Script · Details Gate
//
// A blocking, route-filtered route script (contrast the always-on, non-blocking routeChangeLogger).
// `routes: ["/details"]` is a regex list tested against the pathname, so it fires on the Details
// tab only. Whether a route script blocks the render is set at install time, not in config.
//
// The engine auto-releases the block when the script settles (return or throw), so no call is
// needed to avoid a hang. this.releaseBlockingScript() here releases early: it paints after the
// essential check, then runs non-essential work while the page is already visible.

// The gating check the page waits on. currentEntity() resolves the record (client/custom/pipeline);
// on failure it toasts and returns undefined (no throw).
const entity = await this.currentEntity();

// Essential check done — release so the page paints now; the rest runs while it's visible.
this.releaseBlockingScript();

if (!entity) {
  return;
}

// Non-essential follow-up, after the release. getWithErrors returns an error instead of throwing.
const [tip, tipError] = await this.getWithErrors(
  this.getServiceUrl("dad_jokes", "/"),
);

this.showToast(
  tipError
    ? `Details gate cleared for record ${this.entityId}.`
    : `Details gate cleared for record ${this.entityId}. Tip of the day: ${tip?.joke ?? ""}`,
  { variant: "success" },
);
