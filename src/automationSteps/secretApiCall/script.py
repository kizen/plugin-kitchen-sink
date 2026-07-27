# Kitchen Sink App · Automation Step · Secret Api Call
#
# Proves the `api_key` integration secret (declared in kizen.json's base_config.secrets and in
# this step's config.json `secrets` list) is readable from a Python automation step and usable
# against a real external API — with a retry-with-backoff pattern for 429 rate limits.
#
# Secrets are read from the injected `secrets` dict under the namespaced key
# `<plugin_api_name>__<secret_name>`, even though config.json and kizen.json both declare the
# bare name "api_key".
#
#
# Two calls are made:
#   1. https://hypothesis.sh/api/httptest/status/429?Retry-After=2 - always returns 429 and echoes
#      the Retry-After query param back as a real response header, so this call exhausts MAX_RETRIES
#      and exercises the Retry-After-aware backoff in the step log. (If the endpoint ever omits the
#      header, call_with_retry falls back to exponential 2**attempt delays.)
#   2. https://hypothesis.sh/api/httptest/headers - echoes back every header it received, confirming
#      the secret-derived Authorization was passed properly.

import time

import requests

MAX_RETRIES = 3

auth_header = f"Basic {secrets['kitchen_sink__api_key']}"


def call_with_retry(url):
    attempt = 0    
    response = requests.get(url, headers={"Authorization": auth_header}, timeout=10)

    while response.status_code == 429 and attempt < MAX_RETRIES:
        attempt += 1
        retry_after = response.headers.get("Retry-After")
        delay = int(retry_after) if retry_after and retry_after.isdigit() else 2**attempt

        outputs.log(f"{url} -> 429; retry {attempt}/{MAX_RETRIES} after {delay}s")

        time.sleep(delay)

        response = requests.get(url, headers={"Authorization": auth_header}, timeout=10)
    return response


# 1. Trigger the rate-limit path so the backoff shows up in the step log.
rate_limited_response = call_with_retry("https://hypothesis.sh/api/httptest/status/429?Retry-After=2")

outputs.log(
    f"Rate-limit demo finished with status {rate_limited_response.status_code} "
    f"after exhausting {MAX_RETRIES} retries (httptest /status/429 always returns 429 by design)."
)

# 2. Make the "real" call and prove the secret made into the request
echo_response = call_with_retry("https://hypothesis.sh/api/httptest/headers")

if echo_response.status_code != 200:
    raise Exception(f"Unexpected status from httptest: {echo_response.status_code} - {echo_response.text}")

echoed_headers = echo_response.json().get("headers", {})

outputs.echoed_auth_header = echoed_headers.get("Authorization", "")

outputs.log(f"httptest echoed back Authorization header: {outputs.echoed_auth_header}")
