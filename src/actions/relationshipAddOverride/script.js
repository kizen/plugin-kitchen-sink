// Kitchen Sink App · Action · Relationship Add Override
//
// Replaces the standard "Add Record" modal on a relationship field. Activate it in the object
// settings wizard by setting an object's add record flow setting.
//
// Three ways an add-override can respond:
//   1. custom          - build the record yourself and return its id (the host links it)
//   2. native          - bail to Kizen's native create modal (this.openCreateRecordModal)
//   3. native_related  - bail to the native modal, pre-linked to the host entity
//                        (this.openCreateRelatedRecordModal)
//
// The script should return the ID of the newly created record, so that the Kizen UI can continue
// in the flow and create appropriate relationships as needed.

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const relatedObjectId = this.objectId;

// Choose the path. A select comes back as the full {label, value} option under result.values.<key>.
const choicePrompt = await this.dynamicPrompt({
  title: "Add Related Record",
  size: "small",
  confirmButton: { label: "Continue", variant: "standard", color: "primary" },
  cancelButton: { label: "Cancel", variant: "text", color: "secondary" },
  content: [
    {
      type: "description",
      widthPercent: 100,
      content:
        "Kitchen Sink demo of an Add-Record override. Pick how to create the related record: " +
        "build it here and return its id, or hand off to Kizen's native create modal.",
    },
    {
      type: "select",
      label: "How should we create it?",
      key: "method",
      required: true,
      placeholder: "Choose a path",
      widthPercent: 100,
      options: [
        { label: "Custom - build it here & return the id", value: "custom" },
        {
          label: "Native create modal (openCreateRecordModal)",
          value: "native",
        },
        {
          label: "Native related modal (openCreateRelatedRecordModal)",
          value: "native_related",
        },
      ],
    },
  ],
});

if (choicePrompt.canceled) {
  return;
}

const method = choicePrompt.values.method.value;

if (method === "native") {
  // Bail to the native create modal (needs only the object id).
  await this.openCreateRecordModal(relatedObjectId);

  // Since the script bailed out, there's no new record ID to return
  return;
}

if (method === "native_related") {
  // Same modal, pre-linked to a parent
  await this.openCreateRelatedRecordModal(relatedObjectId, this.entityId);

  // Since the script bailed out, there's no new record ID to return
  return;
}

const namePrompt = await this.dynamicPrompt({
  title: "Create Related Record",
  size: "small",
  confirmButton: {
    label: "Create & return",
    variant: "standard",
    color: "primary",
  },
  cancelButton: { label: "Cancel", variant: "text", color: "secondary" },
  content: [
    {
      type: "description",
      widthPercent: 100,
      content: "Creates a bare-minimum record on the related object.",
    },
    {
      type: "text",
      label: "Record name",
      key: "name",
      placeholder: "New record name",
      required: true,
      widthPercent: 100,
    },
  ],
});

if (namePrompt.canceled) {
  return;
}

const name = namePrompt.values.name.trim();

this.showToast("Creating record…", { variant: "success", autohide: true });

const [created, error] = await this.postWithErrors(
  `/records/${relatedObjectId}/add`,
  {
    fields: [{ name: "name", value: name }],
  },
);

if (error || !created || created.id == null) {
  this.clearToasts();

  this.showToast(
    `Could not create record: ${describeError(error) ?? "no id returned"}`,
    {
      variant: "failure",
      autohide: false,
    },
  );
  return;
}

const newRecordId = String(created.id);

this.clearToasts();

this.showToast(`Created "${name}" — linking it now.`, { variant: "success" });

// Return the recordID. If this script was run from a relationship field, the app handles creating the appropriate relationship.
return newRecordId;
