// Kitchen Sink App · Floating Frame · Iframe Bridge · notifyReceived
//
// eventScripts receive whatever object was passed as runFrameScript()'s third argument as
// `this.args`. Here, the { action, content } message.js relayed from the framed page.
//
// Empty strings are real payloads on this path (the harness posts content: "" when its input
// is blank), so filter on truthiness - `??` would pass "" through and render a bare toast.

const parts = [this.args.action, this.args.content].filter(Boolean);

this.showToast(`Frame received: ${parts.length ? parts.join(" · ") : "(empty message)"}`);
