export const problem = {
    id: "1",
    title: "Palindrome Number",
    difficulty: "Easy",
    tags: ["Math", "String", "Two Pointers"],
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    examples: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and left to right"
      },
      {
        input: "-121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome"
      }
    ],
    constraints: ["-999 <= x <= 999"],
    testCases: [
      {
        input: [-100],
        output: false,
        hidden: false
      },
      {
        input: [232],
        output: true,
        hidden: false
      },
      {
        input: [550],
        output: false,
        hidden: false
      },
      {
        input: [777],
        output: true,
        hidden: true
      },
      {
        input: [420],
        output: false,
        hidden: true
      }
    ],
    returnType: "boolean",
    functionName: "IsPalindrome",
    solutionHint:
      "Convert to string and use two pointer approach. Is there a way of doing this without converting to a string? (math -> (modulus and division))"
  }