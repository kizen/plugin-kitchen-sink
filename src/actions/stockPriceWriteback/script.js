// Kitchen Sink App · Action · Stock Price Writeback

// Fetches the record's ticker's current market price via the yahoo_finance service (same chart
// endpoint as the getTickerPrice automation step, but proxied through this.getServiceUrl instead
// of called directly), and writes it back to the current record.

// Normalize a *WithErrors error (string | Error | object) so a toast never shows "[object Object]".
const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

// Reads the "ticker" field off the current record; falls back to AAPL if it's blank.
const entity = await this.getEntity(this.objectId, this.entityId);
const ticker = (this.getFieldValue(entity, "ticker") || "AAPL").trim().toUpperCase();

const [chartResponse, chartError] = await this.getWithErrors(
  this.getServiceUrl("yahoo_finance", `/v8/finance/chart/${ticker}`),
);

if (chartError) {
  this.showToast(`Could not fetch ${ticker}'s price: ${describeError(chartError)}`, {
    variant: "failure",
    autohide: false,
  });

  return;
}

const price = chartResponse?.chart?.result?.[0]?.meta?.regularMarketPrice;

if (price == null) {
  this.showToast(`Yahoo Finance response for ${ticker} didn't include a price.`, {
    variant: "failure",
    autohide: false,
  });

  return;
}

// The context gives the current object id and record (entity) id.
const [, patchError] = await this.patchWithErrors(
  `/records/${this.objectId}/${this.entityId}`,
  {
    fields: [
      // Overwrite: replaces whatever "target" currently holds.
      { name: "target", value: price },
      // Append: adds to a multi-value field instead of replacing it.
      { name: "price_history", add_values: [price] },
    ],
  },
);

if (patchError) {
  this.showToast(
    `Fetched ${ticker}'s price but failed to save it: ${describeError(patchError)}`,
    {
      variant: "failure",
      autohide: false,
    },
  );
  return;
}

this.showToast(`Wrote ${ticker}'s price ($${price}) to this record.`, {
  variant: "success",
});

// Refresh the entity page in the UI so the updated field value shows.
this.refreshEntity();
