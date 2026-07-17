// Kitchen Sink App · Page · App Page · callback
//
// This page's callback handler. It runs when the app delivers a plugin callback: the app's
// /plugins/callback route parses the return URL's query string and hands it to this page, and the
// engine runs this script with that query object as this.args. Every script (script.js,
// callback.js, each event script) executes in its own fresh worker and context, so this is not
// the same `this` as script.js; only the injected plugin/session values match.
//
// The exact keys depend on what the service redirects with, so this handler surfaces whatever
// arrived rather than assume specific parameter parameter names. (pluginId and the plugin user config
// are injected by the engine on every script; they are filtered out of the display here.)

const INTERNAL_ARG_KEYS = new Set(["pluginId", "__kizen_user_config"]);

const params = Object.fromEntries(
  Object.entries(this.args ?? {}).filter(
    ([key]) => !INTERNAL_ARG_KEYS.has(key),
  ),
);

this.console.log("Plugin callback received:", params);

const count = Object.keys(params).length;
this.showToast(
  count
    ? `Callback received with ${count} parameter(s).`
    : "Callback received.",
  {
    variant: "success",
  },
);
