// Kitchen Sink App · Action · Failure Modes
//
// Always fails in the chosen mode to show how each kind of action failure surfaces in
// the UI:
//   service_error       — a handled failure calling an external service through the proxy
//                         (getWithErrors), surfaced as a sticky failure toast (autohide: false)
//   kizen_error         — a handled failure calling Kizen's own API (not an external service)
//   on_error            — a handled error reported via this.onError() without throwing; sits
//                         between a toast you compose yourself and a raw uncaught throw
//   uncaught_exception  — an unhandled JS exception, thrown with no try/catch around it, so
//                         you can see how the host surfaces a raw script crash
// (If a deliberately-failing endpoint ever succeeds instead, the script says so with a
// success toast rather than pretending it failed.)
//
// To try it: associate this action with any object and run it from a record's action menu.

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const result = await this.dynamicPrompt({
  title: "Failure Modes Demo",
  confirmButton: { label: "Run", variant: "standard" },
  cancelButton: { label: "Cancel", variant: "text" },
  size: "small",
  content: [
    {
      type: "description",
      widthPercent: 100,
      content: "Pick a failure mode. This action is designed to fail.",
    },
    {
      type: "select",
      label: "Failure Mode",
      key: "mode",
      required: true,
      placeholder: "Select a failure mode",
      widthPercent: 100,
      options: [
        {
          label: "Service call failure (handled, toast)",
          value: "service_error",
        },
        { label: "Kizen API failure (handled, toast)", value: "kizen_error" },
        {
          label: "Handled error via onError() (no throw)",
          value: "on_error",
        },
        {
          label: "Uncaught exception (unhandled)",
          value: "uncaught_exception",
        },
      ],
    },
  ],
});

if (result.canceled) {
  return;
}

// A select returns the whole selected option ({label, value}), not just the value.
const mode = result.values.mode.value;

if (mode === "service_error") {
  const [, error] = await this.getWithErrors(
    this.getServiceUrl("dad_jokes", "/this-endpoint-does-not-exist"),
  );

  const reason = describeError(error);

  this.showToast(
    reason
      ? `Service call failed as expected: ${reason}`
      : "Expected this call to fail, but it didn't.",
    { variant: reason ? "failure" : "success", autohide: false },
  );

  return;
}

if (mode === "kizen_error") {
  const [, error] = await this.getWithErrors(
    "/records/does-not-exist/lookup?identifier=nope",
  );

  const reason = describeError(error);

  this.showToast(
    reason
      ? `Kizen API call failed as expected: ${reason}`
      : "Expected this call to fail, but it didn't.",
    { variant: reason ? "failure" : "success", autohide: false },
  );

  return;
}

if (mode === "on_error") {
  // this.onError reports an error to the host WITHOUT throwing, so the script keeps running and
  // returns normally afterward. It sits between the two extremes above: more prominent than a
  // toast you compose yourself, but not the crash of an uncaught throw. Use it to surface a
  // failure you've caught and identified to be an issue with the Kizen platform itself - it will be
  // pushed to sentry as a platform-level error. Generally showing a toast is preferred.
  this.onError(
    new Error(
      "Kitchen Sink: handled error reported via this.onError (no throw).",
    ),
  );
  return;
}

if (mode === "uncaught_exception") {
  // Since this error isn't caught, it bubbles up to the host and lands in Kizen's monitoring
  // stack the same way as this.onError, but it is uncaught and will crash the script.
  throw new Error(
    "Kitchen Sink: deliberate uncaught exception (mode='uncaught_exception').",
  );
}
