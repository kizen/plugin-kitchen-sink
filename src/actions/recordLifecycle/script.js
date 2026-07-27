// Kitchen Sink App · Action · Record Lifecycle

// Creates a record and then follows with a delete action, with confirmation

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const objectId = this.objectId;

// Duplicate names will throw an error on create.
const scratchName = `Kitchen Sink scratch ${Date.now()}`;

this.showToast("Creating a throwaway record…", {
  variant: "success",
  autohide: true,
});

const [created, createError] = await this.postWithErrors(
  `/records/${objectId}/add`,
  {
    fields: [{ name: "name", value: scratchName }],
  },
);

if (createError || !created || created.id == null) {
  this.clearToasts();

  this.showToast(
    `Could not create the record: ${describeError(createError) ?? "no id returned"}`,
    {
      variant: "failure",
      autohide: false,
    },
  );

  return;
}

const newRecordId = String(created.id);

this.clearToasts();

// Confirm before deleting - common pattern that shoud be followed before destructive actions.
const confirm = await this.dynamicPrompt({
  title: "Delete this record?",
  size: "small",
  confirmButton: { label: "Delete it", variant: "standard", color: "primary" },
  cancelButton: { label: "Keep it", variant: "text", color: "secondary" },
  content: [
    {
      type: "description",
      widthPercent: 100,
      content: `Created "${scratchName}" (id ${newRecordId}). Delete it now to finish the lifecycle demo?`,
    },
  ],
});

if (confirm.canceled) {
  this.showToast(
    `Kept "${scratchName}". Delete it manually if you don't want the scratch record.`,
    {
      variant: "success",
    },
  );
  return;
}

const [, deleteError] = await this.deleteWithErrors(
  `/records/${objectId}/${newRecordId}`,
);

if (deleteError) {
  this.showToast(
    `Created the record but couldn't delete it: ${describeError(deleteError)}`,
    {
      variant: "failure",
      autohide: false,
    },
  );
  return;
}

this.showToast("Created a record and deleted it — full lifecycle complete.", {
  variant: "success",
});

// Refresh so the page's blocks reflect the deletion.
this.refreshEntity();
