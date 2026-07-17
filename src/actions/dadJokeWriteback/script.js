// Kitchen Sink App · Action · Dad Joke Writeback

// Fetches a dad joke via the api service configured for the app, and writes it back to the current record.

// Normalize a *WithErrors error (string | Error | object) so a toast never shows "[object Object]".
const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const [jokeResponse, jokeError] = await this.getWithErrors(
  this.getServiceUrl("dad_jokes", "/"),
);

if (jokeError) {
  this.showToast(`Could not fetch a dad joke: ${describeError(jokeError)}`, {
    variant: "failure",
    autohide: false,
  });

  return;
}

const joke = jokeResponse?.joke ?? JSON.stringify(jokeResponse);

// The context gives the current object id and record (entity) id.
const [, patchError] = await this.patchWithErrors(
  `/records/${this.objectId}/${this.entityId}`,
  {
    fields: [
      // Overwrite: replaces whatever "target" currently holds.
      { name: "target", value: joke },
      // Append: adds to a multi-value field instead of replacing it.
      { name: "joke_log", add_values: [joke] },
    ],
  },
);

if (patchError) {
  this.showToast(
    `Fetched a joke but failed to save it: ${describeError(patchError)}`,
    {
      variant: "failure",
      autohide: false,
    },
  );
  return;
}

this.showToast("Wrote a fresh dad joke to this record.", {
  variant: "success",
});

// Refresh the entity page in the UI so the updated field value shows.
this.refreshEntity();
