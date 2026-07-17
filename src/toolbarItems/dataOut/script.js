// Kitchen Sink App · Toolbar Item · Data Out
//
// Two "send data out" primitives, side by side:
//   uploadFile(blob, fileName?, isPublic?) - uploads a file to Kizen's file store and resolves its
//     metadata. It builds the Blob in the worker (workers have Blob/FileReader), so there's no file
//     input. isPublic defaults false.
//   postFormData(url, data, createNewTab?) - submits a classic HTML <form> POST to any URL, bypassing
//     the JSON helpers and the proxy. createNewTab defaults true.
//

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const result = await this.dynamicPrompt({
  title: "Data Out",
  size: "small",
  confirmButton: { label: "Run", variant: "standard", color: "primary" },
  cancelButton: { label: "Cancel", variant: "text", color: "secondary" },
  content: [
    {
      type: "description",
      widthPercent: 100,
      content:
        "Pick a primitive. Upload sends a file to Kizen; Form POST submits a form to an external URL (new tab).",
    },
    {
      type: "select",
      label: "Primitive",
      key: "mode",
      required: true,
      placeholder: "Choose one",
      widthPercent: 100,
      options: [
        { label: "Upload a file to Kizen (uploadFile)", value: "upload" },
        {
          label: "POST a form to an external URL (postFormData)",
          value: "form",
        },
      ],
    },
  ],
});

if (result.canceled) {
  return;
}

const mode = result.values.mode.value;

if (mode === "upload") {
  // Build a small text file in the worker.
  const blob = new Blob(
    [`Kitchen Sink upload at ${new Date().toISOString()}\n`],
    {
      type: "text/plain",
    },
  );

  try {
    // Upload a private file
    const uploaded = await this.uploadFile(
      blob,
      "kitchen-sink-demo.txt",
      false,
    );

    this.console.log("uploadFile() resolved with:", uploaded);

    this.showToast(
      "Uploaded a demo text file to Kizen — details in the console.",
      {
        variant: "success",
      },
    );
  } catch (error) {
    this.showToast(`Upload failed: ${describeError(error)}`, {
      variant: "failure",
      autohide: false,
    });
  }
  return;
}

// mode === "form": POST a form to httptest; it echoes back in a new tab (createNewTab defaults true).
try {
  await this.postFormData("https://hypothesis.sh/api/httptest/post", {
    source: "kitchen-sink",
    submittedAt: new Date().toISOString(),
  });

  this.showToast(
    "Submitted a form POST — check the new tab for httptest's echo.",
    {
      variant: "success",
    },
  );
} catch (error) {
  this.showToast(`Form POST failed: ${describeError(error)}`, {
    variant: "failure",
    autohide: false,
  });
}
