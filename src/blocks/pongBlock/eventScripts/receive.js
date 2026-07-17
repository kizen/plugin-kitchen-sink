// Kitchen Sink App · Block · Pong Block · receive
//
// Invoked when another surface serves at this block via
// this.communicate.runBlockScript("pong_block", "receive", { from })
// Payload on `this.args`. `setSessionData` merges, so the rally count and last color persist
// across hits; picks a fresh color, repaints, and offers a Serve button to volley back.

const PALETTE = ["#fb923c", "#a3e635", "#2dd4bf", "#818cf8", "#f472b6"];

const from = String(this.args.from ?? "unknown");
const rally = Number(this.sessionData?.pongRally ?? 0) + 1;
const lastColor = this.sessionData?.pongColor;
const choices = PALETTE.filter((color) => color !== lastColor);
const color = choices[Math.floor(Math.random() * choices.length)];

this.setSessionData({ pongRally: rally, pongColor: color });
this.console.log(`Pong block: hit by ${from} → rally ${rally}, ${color}`);

this.outputUI(`
  <div class="pp-card pp-card--hit" style="--pp-accent:${color}">
    <div class="pp-top">
      <span class="pp-badge">PONG</span>
      <span class="pp-rally">Rally ${rally}</span>
    </div>
    <p class="pp-msg">Hit by <strong>${from}</strong> — serve back to Ping.</p>
    <button class="pp-btn" data-script="serve">Serve &rarr;</button>
  </div>
`);
