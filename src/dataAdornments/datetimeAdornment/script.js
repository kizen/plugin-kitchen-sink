// Kitchen Sink App · Data Adornment · Datetime Adornment
//
// Reads an adornment's field value and uses this.currentBusiness.timezone to produce a
// relative-time toast.

const target = new Date(this.args.value);

// this.parseDate splits a plain YYYY-MM-DD string into its [year, month, day] parts. The
// adornment value is a full ISO datetime (because it's datetime), so take the date portion
// first, so parseDate splits on "-" and would otherwise fold the time into the day part.
const [datePart] = this.args.value.split("T");

this.console.log("parseDate(datePart):", this.parseDate(datePart)); // e.g. ["2026", "07", "07"]

// Human relative description, rounded to the largest whole unit that fits.
const describeRelativeTime = (date, now = new Date()) => {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < minute) {
    return "right now";
  }

  const [amount, unit] =
    absMs < hour
      ? [Math.round(absMs / minute), "minute"]
      : absMs < day
        ? [Math.round(absMs / hour), "hour"]
        : [Math.round(absMs / day), "day"];

  const plural = amount === 1 ? unit : `${unit}s`;

  return diffMs < 0
    ? `${amount} ${plural} ago`
    : `${amount} ${plural} from now`;
};

// Naming the business timezone in the toast doubles as a quick check that
// this.currentBusiness.timezone is visible to the script.
this.showToast(
  `${describeRelativeTime(target)} (business timezone: ${this.currentBusiness.timezone.name})`,
  { variant: "success" },
);
