// Kitchen Sink App · Calendar Source · Demo · calendars
//
// One of a calendar source's two scripts: this lists the calendars a user can pick
// Returns (host-validated; discards a non-array, warns on bad fields):
//   Required per calendar: { id, name }
//   Optional: { description?, default? }  (default pre-selects)
//
// Lists every calendar on the google_business service (authorize it first). It's business-level;
// all users see the same account, and a real plugin usually wants a user-level service. No
// nextPageToken paging (fine for a demo).

const [data, errors] = await this.getWithErrors(
  this.getServiceUrl("google_business", "/calendar/v3/users/me/calendarList"),
);

// Fetch failed: log it for traceability and return an empty list so this source degrades to
// "no calendars" rather than tearing down. getWithErrors returns the error in the tuple, so
// there is nothing to catch.
if (errors) {
  const message =
    typeof errors === "string"
      ? errors
      : (errors?.message ?? JSON.stringify(errors));

  this.console.error(`Failed to list Google calendars: ${message}`);

  return [];
}

if (!Array.isArray(data?.items)) {
  this.console.error(
    `Failed to list Google calendars: unexpected response shape ${JSON.stringify(data)}`,
  );

  return [];
}

return data.items.map((calendar) => ({
  id: calendar.id,
  name: calendar.summary,
  description: calendar.description,
  default: calendar.primary || false,
}));
