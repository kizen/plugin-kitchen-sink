// Kitchen Sink App · Block · Ping Block
//
// Half of a two-block volley demoing cross-block dispatch with
// this.communicate.runBlockScript(blockAPIName, scriptId, args). Place Ping and Pong on the same
// page, and runBlockScript posts a same-page window event, so the target must be mounted. "Serve"
// (eventScripts/serve.js) hits pong_block's `receive`; only the block that's hit repaints. Rally
// count and color live in sessionData, which survives between this block's runs.

const rally = Number(this.sessionData?.pingRally ?? 0);

const color = this.sessionData?.pingColor;

const inRally = rally > 0 && Boolean(color);

this.console.log(
  `Ping block: mount (${inRally ? `resumed at rally ${rally}` : "idle"})`,
);

this.outputUI(`
  <div class="pp-card ${inRally ? "pp-card--hit" : "pp-card--idle"}"${inRally ? ` style="--pp-accent:${color}"` : ""}>
    <div class="pp-top">
      <span class="pp-badge">PING</span>
      <span class="pp-rally">Rally ${rally}</span>
    </div>
    <p class="pp-msg">${inRally ? "Volleying with <strong>Pong</strong>." : "Idle — serve to hit <strong>Pong</strong>."}</p>
    <button class="pp-btn" data-script="serve">Serve &rarr;</button>
  </div>
`);
