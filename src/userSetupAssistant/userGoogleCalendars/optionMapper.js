// Kitchen Sink App · User Setup Assistant · userGoogleCalendars · optionMapper

({ state }) => {
  const calendars = state.result?.data?.items ?? [];

  return calendars.map((calendar) => {
    return {
      label: calendar.summary,
      value: calendar.id,
    };
  });
};
