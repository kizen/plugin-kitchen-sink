// Kitchen Sink App · Toolbar Item · Dynamic Prompt Tour
//
// The `this.dynamicPrompt` catalog includes every input type
//
// dynamicPrompt content items are identified by `key`, and each value is returned under
// result.values.<key>. The select type is `select` (single or multi-select with allow_multiple.

const result = await this.dynamicPrompt({
  title: "Dynamic Prompt Tour",
  confirmButton: { label: "Submit", variant: "standard" },
  cancelButton: { label: "Cancel", variant: "text" },
  size: "medium",
  content: [
    {
      type: "description",
      widthPercent: 100,
      content:
        "One of every input type. Required fields (✱) are enforced by the host — " +
        "Submit won't proceed until they're filled, so scripts never re-check them.",
    },
    {
      // Text inputs yield result.values.full_name as a plain string ("Jane"), unlike
      // showViewInModal form fields, which are always array-wrapped (["Jane"]) to
      // account for an unknown number of fields or forms.
      type: "text",
      label: "Full name",
      key: "full_name",
      required: true,
      tooltip: "Text fields support required, tooltip, and placeholder.",
      placeholder: "e.g. Jane Smith",
      widthPercent: 100,
    },
    {
      type: "text",
      label: "Nickname",
      key: "nickname",
      default: "none",
      widthPercent: 100,
    },
    {
      type: "number",
      label: "Team size",
      key: "team_size",
      placeholder: "e.g. 12",
      widthPercent: 100,
    },
    {
      type: "boolean",
      label: "Subscribe to updates",
      key: "subscribed",
      default: true,
      widthPercent: 100,
    },
    {
      // Select result is the whole selected option object
      // ({label, value}), not just the value string. Useful for displaying chosen results later.
      type: "select",
      label: "Priority",
      key: "priority",
      required: true,
      placeholder: "Pick a priority",
      widthPercent: 100,
      options: [
        { label: "Low", value: "low" },
        { label: "Medium", value: "medium" },
        { label: "High", value: "high" },
      ],
    },
    {
      type: "select",
      label: "Region (optional)",
      key: "region",
      placeholder: "Leave me unpicked to see the absent-key case",
      widthPercent: 100,
      options: [
        { label: "North America", value: "na" },
        { label: "Europe", value: "eu" },
        { label: "Asia-Pacific", value: "apac" },
      ],
    },
    {
      // Multi-select (allow_multiple) gicen an array of option objects.
      type: "select",
      label: "Channels",
      key: "channels",
      allow_multiple: true,
      placeholder: "Pick any number",
      widthPercent: 100,
      options: [
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Slack", value: "slack" },
      ],
    },
  ],
});

if (result.canceled) {
  return;
}

const { values } = result;

this.console.log("dynamicPrompt raw result.values:", values);
this.console.log("text (plain string):", values.full_name);
this.console.log("text with default:", values.nickname);
this.console.log("number (Number, absent if blank):", values.team_size);
this.console.log("boolean:", values.subscribed);
this.console.log("select (whole option object):", values.priority);
this.console.log("optional select (absent if unpicked):", values.region);
this.console.log("multi-select (array of option objects):", values.channels);

const channelSummary = (values.channels ?? [])
  .map((option) => option.label)
  .join(", ");

this.showToast(
  `Hi ${values.full_name} — priority ${values.priority.label}, ` +
    `channels: ${channelSummary || "none"}. Full shapes are in the console.`,
  { variant: "success" },
);
