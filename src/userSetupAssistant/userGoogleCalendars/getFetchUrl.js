// Kitchen Sink App · User Setup Assistant · userGoogleCalendars · getFetchUrl
//
// Same async-select mechanism as the business assistant's googleCalendar field, but the
// proxy resolves google_user, a user-level OAuth service, so the request carries the
// current user's token and each user sees their own calendars.

({ state }) => {
  return `/external-integrations/proxy/${state.pluginApiName}/google_user/calendar/v3/users/me/calendarList`;
};
