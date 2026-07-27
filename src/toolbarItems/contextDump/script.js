// Kitchen Sink App · Toolbar Item · Context Dump
//
// Dumps what a toolbar-item script can see: the base worker context (business-level, no record
// context). Open the console before running. It also shows `when` gating. config.json's
// "when": "Boolean({{config.enableContextDump}})" hides the item when that setup-assistant toggle
// is off, with no code involved. (Artifact configs use {{config.<key>}}; assistant when-conditions
// use bare {{<key>}}.)

// Business-level install config (setup-assistant values).
this.console.log("config:", this.config);

// Per-user config (user setup assistant).
this.console.log("userConfig:", this.userConfig);

// Who is running the script, and where.
this.console.log("currentUser:", this.currentUser);
this.console.log("currentBusiness:", this.currentBusiness);

// this.location is a guarded partial window.location — reading a missing property throws.
this.console.log("location:", this.location);

// The Kizen app's base path — what relative this.getWithErrors/this.postWithErrors URLs resolve against.
this.console.log("applicationPath:", this.applicationPath);

this.showToast("Context dumped — open the browser console to inspect it.", {
  variant: "success",
});
