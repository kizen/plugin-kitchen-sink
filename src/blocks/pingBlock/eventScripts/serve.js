// Kitchen Sink App · Block · Ping Block · serve
//
// Hit the Pong block by invoking its `receive` event script via runBlockScript.

this.communicate.runBlockScript("pong_block", "receive", { from: "ping" });
