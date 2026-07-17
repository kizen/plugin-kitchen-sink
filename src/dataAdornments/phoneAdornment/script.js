// Kitchen Sink App · Data Adornment · Phone Adornment
//
// Shows the adornment args contract and drives `this.dynamicPrompt` from a click that isn't a
// toolbar item or action. A data adornment is the small icon the host renders next to any field
// whose type matches `field_type` in config.json (i.e. phonenumber here) on a record detail page.
// Clicking it runs this script. The host discards this script's return value. To change the
// record, write through the API (e.g. this.patchWithErrors) and call this.refreshEntity(). This
// demo is read-only.

// The complete args payload every adornment receives, logged on each click so the contract
// is easy to inspect in the browser console.
this.console.log("Data adornment args contract:", {
  value: this.args.value,
  fieldId: this.args.fieldId,
  fieldType: this.args.fieldType,
  objectId: this.args.objectId,
  entityId: this.args.entityId,
  isActivity: this.args.isActivity,
});

// `value` is the field's raw phone string. The host only renders an adornment when the field
// has a value.
const phoneValue = this.args.value;

// this.parsePhone strips "+" characters - not spaces, dashes, parens, or the "x" extension separator.
this.console.log("parsePhone(value):", this.parsePhone(phoneValue));

const result = await this.dynamicPrompt({
  title: "Phone Field Actions",
  confirmButton: { label: "Run", variant: "standard" },
  cancelButton: { label: "Cancel", variant: "text" },
  size: "small",
  content: [
    {
      type: "description",
      widthPercent: 100,
      content: `Field value: ${phoneValue}`,
    },
    {
      type: "select",
      label: "Action",
      key: "action",
      required: true,
      placeholder: "Choose an action",
      widthPercent: 100,
      options: [
        { label: "Call number", value: "call" },
        { label: "Copy to clipboard", value: "copy" },
      ],
    },
  ],
});

if (result.canceled) {
  return;
}

// A select returns the whole selected option ({label, value}), never just the bare value.
const action = result.values.action.value;

if (action === "call") {
  // Kizen phone fields append any extension after an "x" separator (e.g. "+12133734253x123").
  // Split that off first — sanitizing the whole string in one pass would delete the "x" and
  // silently concatenate the extension onto the main number. The extension then rides along
  // as the ";ext=" suffix that RFC 3966 defines for tel: URIs ("tel:+12133734253;ext=123").
  const [mainPart, extPart = ""] = phoneValue.toLowerCase().split("x", 2);
  const digits = mainPart.replace(/[^\d+]/g, "");
  const extension = extPart.replace(/\D/g, "");

  this.openWindow(`tel:${digits}${extension ? `;ext=${extension}` : ""}`);

  return;
}

if (action === "copy") {
  this.copyToClipboard(phoneValue);
  this.showToast("Phone number copied to clipboard.", { variant: "success" });
}
