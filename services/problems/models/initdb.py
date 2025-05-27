# Run migrations into the DB. Curl request to leet code and build it into DB. 

import requests
from bs4 import BeautifulSoup

url = "https://leetcode.com/graphql"
headers = {
    "Content-Type": "application/json"
}
payload = {
    "query": """
        query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
                title
                content
                difficulty
                isPaidOnly
                exampleTestcases
            }
        }
    """,
    "variables": {
        "titleSlug": "two-sum"
    }
}

response = requests.post(url, json=payload, headers=headers)

print(response.status_code)
# print(response.json())  # or response.text if it's not JSON
content = response.json()
# print(content["data"]["question"])
soup = BeautifulSoup(content["data"]["question"]["content"], "html.parser")
print(soup.get_text())