// Kitchen Sink App · Setup Assistant · googleCalendarEvents · optionMapper

({ state }) => {
  const events = state.result?.data?.items ?? [];

  return events.map((event) => {
    return {
      // Events created without a title have no summary at all.
      label: event.summary || "(untitled event)",
      value: event.id,
    };
  });
};
