// Kitchen Sink App · Toolbar Item · User Config Editor
//
// Reads and writes this user's config with getUserConfig() / setUserConfig(), the read-write
// counterpart to the read-only this.userConfig getter (which reflects the user setup assistant).
// The bucket is per-user AND per-component, keyed by pluginComponentId under
// /employee/mine/configs/plugins/{pluginId}. setUserConfig shallow-merges, so you can update one
// key without clobbering the rest. Both require an installed plugin component.
//
// To make persistence obvious, this bumps a runCount each run and lets you edit a note.

const saved = (await this.getUserConfig()) ?? {};
const previousNote = typeof saved.note === "string" ? saved.note : "";
const previousRunCount =
  typeof saved.runCount === "number" ? saved.runCount : 0;

this.console.log("getUserConfig() returned:", saved);

const result = await this.dynamicPrompt({
  title: "My Settings",
  size: "small",
  confirmButton: { label: "Save", variant: "standard", color: "primary" },
  cancelButton: { label: "Cancel", variant: "text", color: "secondary" },
  content: [
    {
      type: "description",
      widthPercent: 100,
      content:
        `You've opened this ${previousRunCount} time(s) before. Saving bumps that counter and ` +
        `stores your note — both come back the next time you open it, because they live in your ` +
        `per-user config, not in this script.`,
    },
    {
      type: "text",
      label: "Note to yourself",
      key: "note",
      // Prefill with the saved value so an edit is a true read-modify-write, not a blank overwrite.
      default: previousNote,
      placeholder: "Anything — it persists across runs for you only",
      widthPercent: 100,
    },
  ],
});

if (result.canceled) {
  return;
}

const nextRunCount = previousRunCount + 1;

// Only pass changed keys — setUserConfig merges them into the existing bucket.
const mutation = await this.setUserConfig({
  note: result.values.note,
  runCount: nextRunCount,
});

this.console.log("setUserConfig() persisted; server returned:", mutation);

this.showToast(
  `Saved. Open count is now ${nextRunCount}. Reopen this item to see it read back.`,
  { variant: "success" },
);
