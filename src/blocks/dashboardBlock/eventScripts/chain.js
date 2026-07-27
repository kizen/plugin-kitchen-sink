// Kitchen Sink App · Block · Dashboard Block · chain
//
// this.runEventScript invokes a sibling event script from code (vs a data-script click). It
// returns void, so there is no result to wait on. The second arg reaches the target as its
// this.args (logContext logs it in this demo).

this.console.log(
  "chain: invoking the logContext event script via runEventScript…",
);

this.runEventScript("logContext", { triggeredBy: "chain", at: Date.now() });
