# Run migrations into the DB. Curl request to leet code for their question bank and add it to DB. 

import requests
from bs4 import BeautifulSoup

QUESTION_1 = "two-sum"
QUESTION_2 = "palindrome-number"
QUESTION_3 = "roman-to-integer"
QUESTION_4 = "longest-common-prefix"
QUESTION_5 = "valid-parantheses"
QUESTION_6 = "merge-two-sorted-lists"
QUESTION_7 = "remove-duplicates-from-sorted-array"
QUESTION_8 = "remove-element"
QUESTION_9 = "find-the-index-of-the-first-occurrence-in-a-string"
QUESTION_10 = "search-insert-position"

url = "https://leetcode.com/graphql"

question_headers = { 
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": "https://leetcode.com/problemset/",
    "Origin": "https://leetcode.com"
}

question_payload = {
    "operationName": "problemsetQuestionList",
    "variables": {
        "categorySlug": "",
        "skip": 0,
        "limit": 10,
        "filters": {
            "difficulty": "EASY"
        }
    },
    "query": """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug,
        limit: $limit,
        skip: $skip,
        filters: $filters
      ) {
        questions: data {
          title
          titleSlug
          difficulty
          frontendQuestionId: questionFrontendId
        }
      }
    }
    """
}
question_response = requests.post(url, json=question_payload, headers=question_headers)
print(question_response.status_code)
questions = [q["titleSlug"] for q in question_response.json()["data"]["problemsetQuestionList"]["questions"]]
print(questions)

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