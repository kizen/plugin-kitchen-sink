// Kitchen Sink App · Block · Pong Block · serve
//
// Hit the Ping block by invoking its `receive` event script via runBlockScript.
// Reaches every mounted instance of ping_block on the page.

this.console.log("Pong block: serving → ping_block");

this.communicate.runBlockScript("ping_block", "receive", { from: "pong" });
