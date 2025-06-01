# Run migrations into the DB. Curl request to leet code for their question bank and add it to DB. 

import requests
from bs4 import BeautifulSoup


QUESTION_10 = "search-insert-position"

questions = [QUESTION_10]
url = "https://leetcode.com/graphql"

for question in questions: 
  specific_question_headers = {
      "Content-Type": "application/json"
  }
  specific_question_payload = {
      "query": """
          query getQuestionDetail($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                  title
                  content
                  difficulty
                  exampleTestcases
                  topicTags {
                    name
                    slug
                }
              }
          }
      """,
      "variables": {
          "titleSlug": question
      }
  }

  specific_response = requests.post(url, json=specific_question_payload, headers=specific_question_headers)

  content = specific_response.json()
  print(content)
  print((content["data"]["question"]["difficulty"])) # DIfficulty
  soup = BeautifulSoup(content["data"]["question"]["content"], "html.parser")
  print(soup.get_text()) # Description

  print("Test cases: ")
  soup2 = BeautifulSoup(content["data"]["question"]["exampleTestcases"], "html.parser")
  print(soup2.get_text())
  result = ""
  resultarr = [] # ARRAY(Test Cases)
  for char in soup2.get_text(): 
    if char == '\n':
      resultarr.append(result)
      result = ""
    else:
      result += char
  
  # Last character
  if result: 
    resultarr.append(result)

  print(resultarr)

  Topics = [t["slug"] for t in content["data"]["question"]["topicTags"]]
  print(Topics) # ARRAY(Topics)