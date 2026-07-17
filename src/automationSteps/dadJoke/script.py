# Kitchen Sink App · Automation Step · Dad Joke
#
# Directly fetches a dad joke from icanhazdadjoke.com and writes to to the target output

import requests

# Calling directly, not through the plugin-controlled proxy service
response = requests.get("https://icanhazdadjoke.com/", headers={"Accept": "text/plain"}, timeout=10)

if response.status_code != 200:
    raise Exception(f"Dad Joke API call failed: {response.status_code} - {response.text}")

outputs.target = response.text
outputs.log(f"Received joke: {response.text}")
