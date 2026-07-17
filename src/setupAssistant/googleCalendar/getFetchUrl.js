// Kitchen Sink App · Setup Assistant · googleCalendar · getFetchUrl
//
// Builds the URL the host fetches this select's options from. Runs in the browser (not a
// worker), with `state` holding every assistant field's current value plus pluginApiName.
// The URL goes through the service proxy, so the google_business token is injected
// server-side. Authorize that service first, or this returns an auth error.

({ state }) => {
  return `/external-integrations/proxy/${state.pluginApiName}/google_business/calendar/v3/users/me/calendarList`;
};
