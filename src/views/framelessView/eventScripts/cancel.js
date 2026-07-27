// Kitchen Sink App · View · Frameless View · cancel
//
// Runs when the footer's Cancel button is clicked. Resolve the modal with no values and
// canceled=true. The caller sees `result.canceled === true`, the same as a host-chrome cancel.

this.closeModal(undefined, true);
