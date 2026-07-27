// Kitchen Sink App · Floating Frame · Iframe Bridge · message
//
// Runs whenever the framed page posts a message up through the proxy. The relayed payload
// always arrives as `this.args.eventData` — by the time this script runs the proxy's own
// envelope has already been unwrapped, so this is exactly what the framed page passed to
// `window.parent.postMessage(...)`, e.g. { action: "hypothesis-test", content: "<input>" }.
const eventData = this.args.eventData;

this.console.log(eventData);

// Dispatch to this same frame's own eventScript, which surfaces the message as a toast.
// runFrameScript's first argument is the receiving frame's api_name — it must match
// config.json's `api_name` (or the sanitized folder-name default, if that key is omitted).
// This message.js → eventScript hop is how a real integration reacts to what the framed page
// just said (e.g. a phone dialer routing an inbound event to call-handling logic).
this.communicate.runFrameScript("iframe_bridge", "notifyReceived", {
  action: eventData?.action,
  content: eventData?.content,
});

// Echo an acknowledgement down into the frame. The message-stream harness renders whatever it
// receives, so this ack appears inside the iframe itself — proving the bridge is two-way, not
// just an inbound-only relay.
this.communicate.sendMessageToOwnFrame(
  { action: "kitchen-sink-ack", receivedContent: eventData?.content },
  "*",
);
