// Kitchen Sink App · Floating Frame · Script Widget · fetchJoke
//
// Same dad_jokes contract this plugin's actions and route scripts use: getServiceUrl() resolves
// the declared service, and getWithErrors() returns a [data, error] tuple instead of throwing

const describeError = (error) =>
  typeof error === "string"
    ? error
    : (error?.message ?? (error ? JSON.stringify(error) : null));

const [jokeResponse, jokeError] = await this.getWithErrors(
  this.getServiceUrl("dad_jokes", "/"),
);

if (jokeError) {
  this.showToast(`Could not fetch a dad joke: ${describeError(jokeError)}`, {
    variant: "failure",
    autohide: false,
  });

  return;
}

this.showToast(jokeResponse?.joke ?? JSON.stringify(jokeResponse), {
  variant: "success",
});
