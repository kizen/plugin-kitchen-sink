# Kitchen Sink App · Automation Step · Get Ticker Price
#
# Directly fetches the given ticker's current market price from Yahoo Finance's public chart API
# and writes it to the target output.

import requests

ticker = inputs.ticker.strip().upper()

# Calling directly, not through the plugin-controlled proxy service
response = requests.get(
    f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}",
    headers={"Accept": "application/json", "User-Agent": "Mozilla/5.0"},
    timeout=10,
)

if response.status_code != 200:
    raise Exception(f"Ticker Price API call failed: {response.status_code} - {response.text}")

price = response.json()["chart"]["result"][0]["meta"]["regularMarketPrice"]

outputs.target = price
outputs.log(f"Received {ticker} price: {price}")
