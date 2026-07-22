// Kitchen Sink App · Page · App Page · greet
//
// Fired on submit of the <form data-script="greet"> in script.js. Form values arrive
// array-wrapped, one array per field name ("your-name": ["Jane"]) - the same shape
// showViewInModal form results use. The name input is marked `required`, so the browser blocks
// an empty submit before this script runs.
//
// The field is "your-name", not "name": DOMPurify's clobbering protection strips name
// attributes whose value collides with a document/form property (see script.js).

const payload = this.args?.formData ?? {};

const first = (key) => payload[key]?.[0];

const name = first("your-name");
const mood = first("mood");

this.showToast(`Hello, ${name}! Logged as "${mood}".`, { variant: "success" });
