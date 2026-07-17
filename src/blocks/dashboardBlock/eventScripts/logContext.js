// Kitchen Sink App · Block · Dashboard Block · logContext
//
// A block worker is a full plugin worker context. `this.location` (the partial window.location
// every plugin script gets), `this.config` (install config from the setup
// assistant), and `this.userConfig` (per-user config) are all available here - the same context
// actions and route scripts receive.

// this.args are whatever triggered this script passed in — empty on a plain button click, or the
// object handed over by runEventScript (see eventScripts/chain.js).
this.console.log("Dashboard block — args:", JSON.stringify(this.args));

this.console.log("Dashboard block — location:", JSON.stringify(this.location));

this.console.log(
  "Dashboard block — install config:",
  JSON.stringify(this.config),
);

this.console.log(
  "Dashboard block — user config:",
  JSON.stringify(this.userConfig),
);
