// Kitchen Sink App · Block · Pong Block
//
// The other half of the volley (see the Ping block for the full contract). Place both blocks on
// the same page. Clicking "Serve" runs eventScripts/serve.js, which calls
// this.communicate.runBlockScript("ping_block", "receive", { from: "pong" }),
// hitting the Ping block's `receive` script. Only the block that is hit repaints.
// Restore prior state on mount (see the Ping block for the rationale): idle on first mount,
// resumed rally count + color on a same-session remount.

const rally = Number(this.sessionData?.pongRally ?? 0);
const color = this.sessionData?.pongColor;
const inRally = rally > 0 && Boolean(color);

this.console.log(
  `Pong block: mount (${inRally ? `resumed at rally ${rally}` : "idle"})`,
);

this.outputUI(`
  <div class="pp-card ${inRally ? "pp-card--hit" : "pp-card--idle"}"${inRally ? ` style="--pp-accent:${color}"` : ""}>
    <div class="pp-top">
      <span class="pp-badge">PONG</span>
      <span class="pp-rally">Rally ${rally}</span>
    </div>
    <p class="pp-msg">${inRally ? "Volleying with <strong>Ping</strong>." : "Idle — serve to hit <strong>Ping</strong>."}</p>
    <button class="pp-btn" data-script="serve">Serve &rarr;</button>
  </div>
`);
