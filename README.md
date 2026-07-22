# Kitchen Sink

A Kizen plugin that exercises every surface the plugin engine supports. It serves two
audiences:

- **QA** installs it once and can smoke-test every engine surface, including deliberate
  failure paths.
- **Plugin developers** can read it as a working, commented reference for each capability.
  Every artifact's comments document the engine contract it relies on — argument shapes,
  return-value rules, and the gotchas that aren't obvious from a first read.

Installation requires the developer program entitlement (`required_entitlement` in
kizen.json), so it only appears in businesses enrolled in the developer program.

## Repository layout

Each surface is a directory under `src/`, and each artifact is a directory inside it.
The common conventions:

- `config.json` declares the artifact (name, api_name, and per-surface options).
- `script.js` / `script.py` is the main script.
- `eventScripts/<name>.js` are handlers dispatched from `data-script="<name>"` attributes
  in rendered markup.
- `styles.css` is the artifact's stylesheet; the engine scopes it to the artifact's own
  markup at inject time, so plain selectors are safe.

JavaScript surfaces run in web workers with no DOM access. UI is painted with
`this.outputUI(markup)` or embedded with `this.outputIframe(url)`, and all interactivity
flows through `data-script` attributes — there is no `addEventListener`.

## Setup

1. **Install** the plugin from the marketplace (requires the developer program entitlement).
2. **Secret**: set the `api_key` integration secret. Any value works — it feeds the
   `echo_basic` service and the `secretApiCall` automation step, both of which call
   httptest (hypothesis.sh/api/httptest), which just echoes the resulting Authorization header back.
3. **Google OAuth**: the `google_user` and `google_business` services declare encrypted
   client credentials. The committed values are placeholders; the OAuth-dependent surfaces
   (authorize flows, calendar source, async selects) only work once real credentials are
   encrypted for this plugin and published.
4. **Setup assistant**: the business setup assistant saves the install config. Its feature
   toggles gate several surfaces (`enableFloatingFrames`, `enableAdornments`,
   `enableObjectSettingsItem`, `enableContextDump`, `enableBlocks`) via `when` conditions,
   so you can watch artifacts appear and disappear without code changes.

## Surfaces

### kizen.json — services and manifest

Declares four services, one per auth shape:

| Service           | auth_type                 | auth_level | Consumed by                                                                             |
| ----------------- | ------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `google_user`     | oauth                     | user       | authorizeService toolbar item, app page, user setup assistant                           |
| `google_business` | oauth                     | business   | calendar source, setup assistant async selects                                          |
| `echo_basic`      | basic_auth_token_provided | global     | performActionDemo action                                                                |
| `dad_jokes`       | no_auth                   | —          | dadJokeWriteback and failureModes actions, detailsGate route script, scriptWidget frame |

Also demonstrates `base_config.secrets`, top-level `required_entitlement`, and an install
config sourced entirely from the setup assistant (`config_template` is empty).

### Actions (`src/actions/`)

Scripts that run with record context from a record's action menu (or one of the override
surfaces below):

- **dadJokeWriteback** — record writeback: the overwrite shape (`{name, value}`) and the
  append shape (`{name, add_values}`), plus calling an external API through the service
  proxy with `this.getServiceUrl()`.
- **relationshipAddOverride** — replaces the standard "Add Record" modal on a relationship
  field. Documents the return-value contract: return the new record's id as a non-empty
  string, or undefined to do nothing.
- **performActionDemo** — the "Perform Action" menu surface, plus a
  `basic_auth_token_provided` service where the proxy injects the Authorization header
  server-side and the script never touches the secret.
- **failureModes** — always fails, in the mode you pick: handled service failure, handled
  Kizen API failure, or an uncaught exception.

### Automation steps (`src/automationSteps/`, Python)

Code steps a workflow author drops into an automation:

- **allTypesRoundTrip** — one input and output per supported `data_type` (all 10), logging
  the Python type each value deserializes to and passing it through unchanged.
- **secretApiCall** — reads the namespaced `api_key` secret, builds a Basic auth header,
  and demonstrates 429 retry with exponential backoff and Retry-After handling.
- **dadJoke** — the simplest possible step: one GET, one output.
- **failOnPurpose** — always fails: plain exception, unhandled HTTP error, or timeout.

Python steps call external APIs directly with `requests` — they have no access to the
`services[]` abstraction or the engine proxy. That's a JavaScript-surface capability.

### Blocks (`src/blocks/`)

Plugin-provided dashlets, one per block type plus a communication demo:

- **dashboardBlock** — the fully-specified reference: sizing config, `when` gating, styles,
  and event scripts that repaint in place and log the worker context.
- **homepageBlock** — opens one of this plugin's views with `showViewInModal` and reads the
  submitted form values back.
- **chartGroupBlock** — reads install config (`this.config.contextValue`) into its markup.
- **recordBlock** — minimal config, documenting the packager defaults.
- **pingBlock / pongBlock** — cross-block dispatch with
  `this.communicate.runBlockScript()`: place both on the same page and volley between them.
  Also demonstrates `sessionData` for state that survives remounts.

### Calendar source (`src/calendarSources/demo/`)

`calendars.js` lists Google calendars, `events.js` lists one calendar's events for a
requested range — both through the `google_business` service. Documents the host's
validated return schemas, all-day event detection, and the `activity_id` linkage for
events created by Kizen's own calendar sync.

### Data adornments (`src/dataAdornments/`)

Small icons the host renders next to matching field types on record detail pages:

- **phoneAdornment** (`field_type: "phonenumber"`) — logs the full args contract, then
  offers call (`tel:` with RFC 3966 extension handling) or copy-to-clipboard.
- **datetimeAdornment** (`field_type: "datetime"`) — parses the field value and shows a
  relative-time toast with the business timezone.

Adornment scripts run in the same worker as actions, and their return values are
discarded — to change the record, write through the API and call `refreshEntity()`.

### Floating frames (`src/floatingFrames/`)

Persistent, minimizable widgets anchored to a corner of the app:

- **scriptWidget** — a script-rendered frame (`outputUI`) with buttons for every
  frame-only context method: `hide`, `collapse`, `expand`, `hideHeader`, `showHeader`. The
  only `bottom-left-fixed` frame, which is why it demos `hideHeader`/`showHeader` (honored
  only on fixed frames). Fixed forces `minimized_style: "circle"` — the engine anchors a
  fixed frame to its minimized circle trigger, so a `bar`-style fixed frame would never
  reposition on resize — and its `minimized_config` sets the circle via a platform icon
  name (`window-restore`).
- **iframeScoped** — embeds an external page with an origin-scoped `allow` grant, and
  documents how permission delegation flows through the iframe proxy. Uses
  `minimized_style: "bar"`, valid here because it is non-fixed (`bottom-right`).
- **iframeBridge** — the two-way postMessage bridge: `message.js` receives what the framed
  page posts, relays it to an event script, and acks back down into the frame. Its
  `minimized_config` sets the circle from a bundled `customIconFile` instead of a platform
  icon name.

### Object settings items (`src/objectSettingsItems/`)

Entries added to an object's settings menu:

- **inspectObject** — an entry in the settings-gear dropdown on an object's Records page.
  Runs with object context only (no current record) and acts through side effects; its
  return value is discarded.

### Pages (`src/pages/appPage/`)

A routable full-page app page at `/plugins/kitchen_sink/app_page`, also exposed as a
toolbar entry (`is_toolbar_item`). Demonstrates query args on `this.args`, form and button
event scripts, and the OAuth pair: `eventScripts/authorizeGoogle.js` starts the flow and
`callback.js` runs when the app delivers the plugin callback.

### Route scripts (`src/routeScripts/`)

Scripts that run on navigation to a record detail page of the bound object:

- **routeChangeLogger** — the observer: empty `routes` (every detail tab), non-blocking,
  logs the navigation context (`previousRoute`, `currentRoute`, `this.location`).
- **detailsGate** — the gate: `routes: ["/details"]`, meant to be installed blocking.
  Demonstrates `releaseBlockingScript()` as an early release so the page paints before
  non-essential follow-up work finishes.

### Setup assistant (`src/setupAssistant/`)

`assistant.json` demonstrates every field type — descriptions (markdown and HTML),
containers, booleans, text with `validation_pattern`, number, single/multi selects, object
and field pickers, image, QR, and link — plus conditional visibility (`when`), a service
prerequisite step, and action association. The `googleCalendar` / `googleCalendarEvents`
directories back two async selects: options fetched live through the service proxy, with
`autoSelect` and `dependencies` behavior.

### User setup assistant (`src/userSetupAssistant/`)

The per-user counterpart: each user answers for themselves, and scripts read the values
from `this.userConfig`. Includes a `google_user` prerequisite and an async select that
fetches with the current user's token.

### Toolbar items (`src/toolbarItems/`)

Global toolbar entries that run a script on click:

- **modalLauncher** — the `showViewInModal` tour: framed vs. frameless modals, all three
  sizes, and chaining one modal's result into the next.
- **dynamicPromptTour** — every `dynamicPrompt` input type and the exact result shape each
  one returns.
- **authorizeService** — starts the `google_user` OAuth flow with `this.authorize()`.
- **contextDump** — logs everything a base worker context can see, and demonstrates `when`
  gating from install config.

### Views (`src/views/`)

Modal content opened with `showViewInModal` from any worker context:

- **formView** — a framed form: host chrome renders the buttons, runs native form
  validation, and collects the (array-wrapped) form data itself. No event scripts needed.
- **framelessView** — the opposite: the view owns its chrome and closes its own modal with
  `closeModal` from submit/cancel event scripts.
- **summaryView** — display-only; receives another modal's form data through `args` and
  renders raw vs. display values so the array-wrapping is visible.

## Failure paths

Negative-path coverage is deliberate and spread across surfaces: the **failureModes**
action (three JS failure modes), the **failOnPurpose** automation step (three Python
failure modes), and **secretApiCall**'s always-429 first call (retry exhaustion). Each one
documents how its failure surfaces in the UI or run history.
