# Kitchen Sink App · Automation Step · Fail On Purpose
#
# Always fails, in one of three ways, providing a reliable negative-path fixture for
# code steps:
#
#   raise      - a plain, unhandled Python exception (the most common real-world failure)
#   http_error - an unhandled non-2xx response from a real HTTP call (httpbin.org/status/500)
#   timeout    - a network timeout (httpbin.org/delay/10 with a 2s client-side timeout)

import requests

mode = inputs.failure_mode

if mode == "raise":
    raise ValueError("Kitchen Sink: deliberate failure via a plain Python exception (failure_mode='raise').")

elif mode == "http_error":
    response = requests.get("https://httpbin.org/status/500", timeout=10)

    raise Exception(
        f"Kitchen Sink: deliberate failure via an unhandled non-2xx response "
        f"(failure_mode='http_error') - httpbin.org returned {response.status_code}."
    )

elif mode == "timeout":
    # httpbin.org/delay/10 sleeps 10s server-side; a 2s client timeout guarantees
    # requests.exceptions.Timeout instead of an actual 10s wait.
    requests.get("https://httpbin.org/delay/10", timeout=2)

else:
    # Reachable: allowed_values isn't enforced strictly, so any string can land here.
    raise ValueError(f"Kitchen Sink: unknown failure_mode {mode!r} — this branch itself is the failure.")
