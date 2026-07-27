// Kitchen Sink App · Route Script · Route Change Logger
//
// Runs on every record-detail page of its bound object: a non-blocking observer with empty
// routes:[], which means "every tab" (contrast the filtered, blocking detailsGate). The engine
// hands it the navigation transition on this.args (previousRoute/currentRoute) plus this.location and the
// record ids. Has the record-detail context but no DOM; this.openWindow(url, target) can drive
// in-app nav for a relative url with a non-"_blank" target.

// previousRoute is empty on a direct link or refresh (no in-app page to come from).
const { previousRoute, currentRoute } = this.args;

const arrivedByInAppNav = Boolean(previousRoute);

// this.location mirrors window.location for the worker.
const { search, hash } = this.location;
const extras = [search, hash].filter(Boolean).join(" ");

const arrival = arrivedByInAppNav
  ? `navigated here from ${previousRoute}`
  : "opened this record directly (deep link or refresh)";

this.showToast(
  `Route script saw record ${this.entityId} on object ${this.objectId}: ${arrival}` +
    (extras ? ` — url extras: ${extras}` : "") +
    ` (now at ${currentRoute}).`,
  { variant: "alert" },
);
