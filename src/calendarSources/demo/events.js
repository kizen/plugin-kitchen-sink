// Kitchen Sink App · Calendar Source · Demo · events
//
// Lists one calendar's events for a date range. The host calls it per (calendar, range) pair, passing
// this.args.calendar = { calendar_id, range_start, range_end } (RFC3339 timestamps).
//
// Return per event (host-validated):
//   Required: { id, calendar_id, title, start_time, end_time } - times are epoch ms
//   Optional: { description?, url?, activity_id?, all_day?, busy? }
// this.formatDateForResponse(date) is just date.getTime().

const { calendar_id, range_start, range_end } = this.args.calendar;

// Google flags all-day events with a `date` (not `dateTime`) on start/end — there's no boolean.
const isAllDayEvent = (event) =>
  Boolean(
    !event.start.dateTime &&
    !event.end.dateTime &&
    event.start.date &&
    event.end.date,
  );

// Parse all-day dates as local midnight (createDateObject) so a DST boundary can't shift the day;
// timed events carry their own offset in dateTime.
const parseEventBounds = (event) => {
  try {
    if (isAllDayEvent(event)) {
      return {
        startDate: this.createDateObject(event.start.date),
        endDate: this.createDateObject(event.end.date),
      };
    }

    return {
      startDate: new Date(event.start.dateTime),
      endDate: new Date(event.end.dateTime),
    };
  } catch (ex) {
    // Drop an unparseable event rather than fail the whole list; log it for traceability in the demo.
    this.console.warn(
      `Skipping event ${event.id} with unparseable start/end`,
      event,
    );
    return {};
  }
};

// No nextPageToken paging — fine for a demo; a production source should follow it.
const [data, errors] = await this.getWithErrors(
  this.getServiceUrl(
    "google_business",
    `/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events?timeMin=${encodeURIComponent(
      range_start,
    )}&timeMax=${encodeURIComponent(range_end)}&singleEvents=true`,
  ),
);

// Fetch failed: log it for traceability and return an empty list so this calendar degrades to
// "no events" rather than tearing down. getWithErrors returns the error in the tuple, so there
// is nothing to catch.
if (errors) {
  const message =
    typeof errors === "string"
      ? errors
      : (errors?.message ?? JSON.stringify(errors));

  this.console.error(
    `Failed to list events for calendar ${calendar_id}: ${message}`,
  );
  return [];
}

if (!Array.isArray(data?.items)) {
  this.console.error(
    `Failed to list events for calendar ${calendar_id}: unexpected response shape ${JSON.stringify(data)}`,
  );
  return [];
}

return (
  data.items
    // Skip Google's workingLocation entries — not real events.
    .filter((event) => event.eventType !== "workingLocation")
    .map((event) => {
      const { startDate, endDate } = parseEventBounds(event);

      if (!startDate || !endDate) {
        return null;
      }

      // Kizen-synced events can carry an iCalUID "{activityId}--…" — extract it to link back; absent
      // for events created directly in Google.
      const activityId = event.iCalUID?.includes("--")
        ? event.iCalUID.split("--")[0]
        : undefined;

      return {
        id: event.id,
        calendar_id,
        activity_id: activityId,
        title: event.summary,
        description: event.description,
        start_time: this.formatDateForResponse(startDate),
        end_time: this.formatDateForResponse(endDate),
        all_day: isAllDayEvent(event),
        // Google represents free/busy as "transparency"; "transparent" means free.
        busy: event.transparency !== "transparent",
        url: event.htmlLink,
      };
    })
    .filter((event) => event !== null)
);
