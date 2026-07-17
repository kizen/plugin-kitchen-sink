// Kitchen Sink App · Floating Frame · Iframe Bridge · notifyReceived
//
// eventScripts receive whatever object was passed as runFrameScript()'s third argument as
// `this.args`. Here, the { action, content } message.js relayed from the framed page.

this.showToast(
  `Frame received: ${this.args.content ?? this.args.action ?? "(empty message)"}`,
);
