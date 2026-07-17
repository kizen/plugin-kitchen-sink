// Kitchen Sink App · Block · Ping Block · receive
//
// Invoked when another surface serves at this block:
//   this.communicate.runBlockScript("ping_block", "receive", { from })
// The dispatched payload arrives on `this.args`. `setSessionData` merges into existing session
// state rather than replacing it, so the rally count and last color persist across hits.

const PALETTE = ["#f87171", "#facc15", "#4ade80", "#60a5fa", "#e879f9"];
const from = String(this.args.from ?? "unknown");
const rally = Number(this.sessionData?.pingRally ?? 0) + 1;
const lastColor = this.sessionData?.pingColor;
const choices = PALETTE.filter((color) => color !== lastColor);
const color = choices[Math.floor(Math.random() * choices.length)];

this.setSessionData({ pingRally: rally, pingColor: color });

this.console.log(`Ping block: hit by ${from} → rally ${rally}, ${color}`);

this.outputUI(`
  <div class="pp-card pp-card--hit" style="--pp-accent:${color}">
    <div class="pp-top">
      <span class="pp-badge">PING</span>
      <span class="pp-rally">Rally ${rally}</span>
    </div>
    <p class="pp-msg">Hit by <strong>${from}</strong> — serve back to Pong.</p>
    <button class="pp-btn" data-script="serve">Serve &rarr;</button>
  </div>
`);
