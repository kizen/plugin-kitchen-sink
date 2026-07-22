// Kitchen Sink App · Page · App Page · authorizeGoogle
//
// Fired on click of the "Authorize Google" button. this.authorize opens the service's OAuth
// authorization URL in a new tab. Optional
// successRedirectPath / errorRedirectPath become query params on that URL; omitted, both default
// to /marketplace/<plugin>/auth.
//
// The call is fire-and-forget: the flow finishes in the new tab, which the backend redirects to
// the success/error path. Nothing is delivered back to this page - check the marketplace
// Authorization panel (it refetches on window focus) for the outcome.
//
// This is a page-side consumer of the google_user (user-level OAuth) service declared in
// kizen.json.

this.authorize("google_user");
