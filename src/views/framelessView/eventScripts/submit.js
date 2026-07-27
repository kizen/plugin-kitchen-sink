// Kitchen Sink App · View · Frameless View · submit
//
// Runs when the form submits (the footer's type="submit" button). Native validation has already
// passed by this point, since the browser handles required fields.
//
// Form values arrive on `this.args.formData`, keyed by input `name`, with every value
// array-wrapped (FormData.getAll semantics): {"display-name": ["Jane"], ...}. This passes the
// wrapped shape through untouched, and the caller (and summaryView) unwraps it.

this.closeModal({ formData: this.args.formData }, false);
