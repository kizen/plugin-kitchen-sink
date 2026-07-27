// Kitchen Sink App · Toolbar Item · Authorize Service
//
// Starts the OAuth flow for the google_user service (user-level token). this.authorize(service)
// opens the authorize endpoint in a new tab, with nothing to await. By
// default it redirects back to /marketplace/{plugin}/auth ({successRedirectPath, errorRedirectPath}
// override that). Afterward, this.getWithErrors(this.getServiceUrl("google_user", ...)) makes calls
// authorized using the token.

this.authorize("google_user");

this.showToast(
  "Google authorization opened in a new tab. Finish there, then come back.",
  { variant: "alert" },
);
