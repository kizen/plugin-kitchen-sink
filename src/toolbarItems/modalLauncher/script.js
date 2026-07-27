// Kitchen Sink App · Toolbar Item · Modal Launcher
//
// The showViewInModal tour: opens a form view, then chains its result into a second modal
// (summaryView) by forwarding formData through args. It covers framed modals (host chrome validates
// and collects the form), frameless modals (frameless: true, the view owns its chrome and closes
// itself), sizes small/medium/large (400/900/1200px), and the result shape
// { canceled, values, eventSource }, with form data at result.values.formData and values
// array-wrapped. The view key is the view's api_name (folder name lowercased unless config.json
// overrides).

const choice = await this.dynamicPrompt({
  title: "Modal Launcher",
  confirmButton: { label: "Open", variant: "standard" },
  cancelButton: { label: "Cancel", variant: "text" },
  size: "small",
  content: [
    {
      type: "select",
      label: "Which form style?",
      key: "style",
      required: true,
      placeholder: "Pick a style",
      widthPercent: 100,
      options: [
        { label: "Framed — host chrome collects the form", value: "framed" },
        { label: "Frameless — the view owns its chrome", value: "frameless" },
      ],
    },
  ],
});

if (choice.canceled) {
  return;
}

// A select's value is the whole selected option ({label, value}), not just the value.
const style = choice.values.style.value;

const formResult =
  style === "framed"
    ? await this.showViewInModal("formview", {
        options: {
          title: "Framed form",
          confirmButton: { label: "Submit" },
          cancelButton: { label: "Never mind" },
          size: "medium",
        },
      })
    : await this.showViewInModal("framelessview", {
        options: { frameless: true, size: "small" },
      });

if (formResult.canceled) {
  this.showToast("Modal canceled — nothing to summarize.", {
    variant: "alert",
  });

  return;
}

// Forward the first modal's data into summaryView (reads this.args.formData). Its own result is
// ignored, it's display-only.
await this.showViewInModal("summaryview", {
  args: { formData: formResult.values.formData },
  options: {
    title: "What the modal returned",
    confirmButton: { label: "Done" },
    size: "large",
  },
});
