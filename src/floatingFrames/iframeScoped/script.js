// Kitchen Sink App · Floating Frame · Iframe Scoped
//
// Embeds an external page with this.outputIframe(url, allow). The allow array is origin-scoped
// least-privilege: "microphone https://hypothesis.sh" grants mic to that origin with no
// re-delegation ("microphone *" would allow it). The scoped origin must exactly match the framed
// URL's origin, and the URL needs an explicit https scheme (the proxy rejects non-HTTPS).

this.outputIframe("https://hypothesis.sh/message-stream", [
  "microphone https://hypothesis.sh",
]);
