// Kitchen Sink App · Setup Assistant · googleCalendarEvents · getFetchUrl
//
// A dependent async select: assistant.json declares dependencies: ["googleCalendar"], so
// the host re-runs this fetch whenever that field changes. Another field's value is read
// from state, and a picked select is a {label, value} option object, hence .value?.value.

({ state }) => {
  // Fall back to Google's "primary" calendar alias so the URL is valid before a
  // calendar has been picked.
  const calendarId = state.googleCalendar?.value?.value || "primary";

  return `/external-integrations/proxy/${
    state.pluginApiName
  }/google_business/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?maxResults=25`;
};
