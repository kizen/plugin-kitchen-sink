// Kitchen Sink App · Setup Assistant · googleCalendar · optionMapper
//
// Maps the fetch response (on state.result) to select options. Google's calendarList
// nests the calendars under data.items.

({ state }) => {
  const calendars = state.result?.data?.items ?? [];

  return calendars.map((calendar) => {
    return {
      label: calendar.summary,
      value: calendar.id,
    };
  });
};
