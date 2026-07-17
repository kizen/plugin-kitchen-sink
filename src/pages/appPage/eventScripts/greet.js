// Kitchen Sink App · Page · App Page · greet
//
// Fired on submit of the <form data-script="greet"> in script.js. Form values arrive
// array-wrapped, one array per field name (name: ["Jane"]) - the same shape showViewInModal form
// results use. The name input is marked `required`, so the browser blocks an empty submit before
// this script runs.

const payload = this.args?.formData ?? {};

const first = (key) => payload[key]?.[0];

const name = first("name");
const mood = first("mood");

this.showToast(`Hello, ${name}! Logged as "${mood}".`, { variant: "success" });
