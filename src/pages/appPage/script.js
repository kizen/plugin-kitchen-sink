// Kitchen Sink App · Page · App Page
//
// A routable full-page app page at /plugins/kitchen_sink/app_page, also reachable from a global
// toolbar entry (note config.json's is_toolbar_item). It paints markup with this.outputUI from a worker
// (no DOM), so interactivity flows through data-script calling eventScripts/: <form data-script="greet">
// calls greet.js (fields on this.args.formData, array-wrapped)
//
// The authorizeGoogle button runs its defined event script. this.args is the URL query parsed to an
// object (?ref=email becomes { ref: "email" });
//
// The engine also injects internal keys, filtered below.
//
// Field-name gotcha: outputUI markup is sanitized with DOMPurify, whose DOM-clobbering
// protection strips any name/id attribute whose VALUE is a property of document or of a form
// element (name, id, action, method, title, length, ...). An <input name="name"> silently loses
// its name and never reaches formData - hence "your-name" below.

const INTERNAL_ARG_KEYS = new Set(["pluginId", "__kizen_user_config"]);

const queryArgs = Object.entries(this.args ?? {}).filter(
  ([key]) => !INTERNAL_ARG_KEYS.has(key),
);

const argsMarkup = queryArgs.length
  ? `<ul class="ks-args">${queryArgs
      .map(
        ([key, value]) =>
          `<li><code>${key}</code> = <code>${String(value)}</code></li>`,
      )
      .join("")}</ul>`
  : `<p class="ks-muted">No query parameters. Append <code>?ref=email</code> to the URL and reload to see them arrive as <code>this.args</code>.</p>`;

this.outputUI(`
  <div class="ks-page">
    <header class="ks-hero">
      <h1>Kitchen Sink Page</h1>
      <p>A routable plugin page rendered with <code>outputUI</code>. The worker has no live DOM, so
      every button and form below is wired through <code>data-script</code>.</p>
    </header>

    <section class="ks-card">
      <h2>Query arguments</h2>
      <p class="ks-muted">The page URL's query string arrives as <code>this.args</code>.</p>
      ${argsMarkup}
    </section>

    <section class="ks-card">
      <h2>Form &rarr; event script</h2>
      <p class="ks-muted">Submitting runs <code>eventScripts/greet.js</code> with the fields under
      <code>this.args.formData</code>.</p>
      <form class="ks-form" data-script="greet">
        <label>Your name
          <input name="your-name" type="text" placeholder="Jane" required />
        </label>
        <label>Mood
          <select name="mood">
            <option value="curious">Curious</option>
            <option value="delighted">Delighted</option>
            <option value="skeptical">Skeptical</option>
          </select>
        </label>
        <button type="submit">Greet me</button>
      </form>
    </section>

    <section class="ks-card">
      <h2>OAuth authorize</h2>
      <p class="ks-muted">Opens the Google authorization flow in a new tab. When the flow
      completes, that tab lands on the plugin's marketplace Authorization panel, which shows the
      result.</p>
      <button type="button" class="ks-btn" data-script="authorizeGoogle">Authorize Google</button>
    </section>
  </div>
`);
