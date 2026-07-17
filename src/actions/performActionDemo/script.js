// Kitchen Sink App · Action · Perform Action Demo
//
// Appears in the record-detail "Perform Action" menu when a business enables "include in Perform
// Action" on the association. Uses a basic_auth_token_provided service
// (echo_basic → httptest): /headers echoes the headers back to confirm it arrived.
// Needs a datetime field `last_perform_action_run`.

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const [echoed, error] = await this.getWithErrors(
  this.getServiceUrl("echo_basic", "/headers"),
);

if (error) {
  this.showToast(`Echo service call failed: ${describeError(error)}`, {
    variant: "failure",
    autohide: false,
  });
  return;
}

const authHeaderSeen = Boolean(echoed?.headers?.Authorization);

// Demo-only logging: these echoed headers include the secret-derived Authorization value.
// This is fine with a throwaway demo secret, but never log headers built from real credentials.
this.console.log(
  "httptest echoed headers:",
  echoed?.headers,
  "Authorization header present:",
  authHeaderSeen,
);

// The context exposes the object id and record (entity) id
const [, patchError] = await this.patchWithErrors(
  `/records/${this.objectId}/${this.entityId}`,
  {
    fields: [
      { name: "last_perform_action_run", value: new Date().toISOString() },
    ],
  },
);

if (patchError) {
  this.showToast(
    `Echo succeeded but saving the timestamp failed: ${describeError(patchError)}`,
    {
      variant: "failure",
      autohide: false,
    },
  );
  return;
}

this.showToast(
  authHeaderSeen
    ? "Pinged the echo service — the secret-derived Authorization header made it through the proxy."
    : "Pinged the echo service, but no Authorization header came back — check the api_key secret is configured.",
  { variant: authHeaderSeen ? "success" : "failure" },
);

// Reload the entity in the UI to show the updated values
this.refreshEntity();
