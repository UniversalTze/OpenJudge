
export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    input: string;
    output: string;
  }[];
  solutionHint?: string;
  languages: string[];
  lastAttempt?: {
    date: string;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'In Progress';
  };
  userCode?: {
    python?: string;
    java?: string;
  };
}

export const problems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.
    `,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]'
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]'
      },
      {
        input: '[3,3]\n6',
        output: '[0,1]'
      },
      {
        input: '[1,5,8,3,9,2]\n7',
        output: '[0,5]'
      }
    ],
    solutionHint: 'Try using a hash map to store numbers and their indices as you iterate through the array.',
    languages: ['Python', 'Java']
  },
  {
    id: '2',
    title: 'Reverse String',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    description: `
Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.
    `,
    examples: [
      {
        input: '["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character'
    ],
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      },
      {
        input: '["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]'
      },
      {
        input: '["a"]',
        output: '["a"]'
      },
      {
        input: '["a","b"]',
        output: '["b","a"]'
      }
    ],
    languages: ['Python', 'Java']
  },
  {
    id: '3',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    description: `
Given an integer array nums, find the subarray which has the largest sum and return its sum.

A subarray is a contiguous part of an array.
    `,
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: '[4,-1,2,1] has the largest sum = 6.'
      },
      {
        input: '[1]',
        output: '1'
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    testCases: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6'
      },
      {
        input: '[1]',
        output: '1'
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23'
      },
      {
        input: '[-1]',
        output: '-1'
      }
    ],
    solutionHint: "Look into Kadane's algorithm for an optimal approach. Consider the maximum subarray that ends at each position.",
    languages: ['Python', 'Java']
  },
  {
    id: '4',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    description: `
You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.
    `,
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]'
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]'
      },
      {
        input: 'list1 = [], list2 = [0]',
        output: '[0]'
      }
    ],
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.'
    ],
    testCases: [
      {
        input: '[1,2,4]\n[1,3,4]',
        output: '[1,1,2,3,4,4]'
      },
      {
        input: '[]\n[]',
        output: '[]'
      },
      {
        input: '[]\n[0]',
        output: '[0]'
      },
      {
        input: '[1,5,7]\n[2,4,6]',
        output: '[1,2,4,5,6,7]'
      }
    ],
    languages: ['Python', 'Java']
  },
  {
    id: '5',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    description: `
Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.
    `,
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\''
    ],
    testCases: [
      {
        input: '"()"',
        output: 'true'
      },
      {
        input: '"()[]{}"',
        output: 'true'
      },
      {
        input: '"(]"',
        output: 'false'
      },
      {
        input: '"([)]"',
        output: 'false'
      },
      {
        input: '"{[]}"',
        output: 'true'
      }
    ],
    solutionHint: 'Consider using a stack data structure to keep track of opening brackets and match them with closing brackets.',
    languages: ['Python', 'Java']
  },
  {
    id: '6',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    description: `
Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).
    `,
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]'
      },
      {
        input: 'root = [1]',
        output: '[[1]]'
      },
      {
        input: 'root = []',
        output: '[]'
      }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000'
    ],
    testCases: [
      {
        input: '[3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]'
      },
      {
        input: '[1]',
        output: '[[1]]'
      },
      {
        input: '[]',
        output: '[]'
      },
      {
        input: '[1,2,3,4,5]',
        output: '[[1],[2,3],[4,5]]'
      }
    ],
    solutionHint: 'Use a queue to implement a breadth-first search traversal, keeping track of the level.',
    languages: ['Python', 'Java']
  },
  {
    id: '7',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    description: `
You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?
    `,
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps'
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step'
      }
    ],
    constraints: [
      '1 <= n <= 45'
    ],
    testCases: [
      {
        input: '2',
        output: '2'
      },
      {
        input: '3',
        output: '3'
      },
      {
        input: '4',
        output: '5'
      },
      {
        input: '5',
        output: '8'
      }
    ],
    solutionHint: 'Notice the pattern of results. Try to find a recurrence relation.',
    languages: ['Python', 'Java']
  },
  {
    id: '8',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    description: `
Given a string s, return the longest palindromic substring in s.

A palindrome is a string that reads the same backward as forward.
    `,
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.'
      },
      {
        input: 's = "cbbd"',
        output: '"bb"'
      }
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.'
    ],
    testCases: [
      {
        input: '"babad"',
        output: '"bab"'
      },
      {
        input: '"cbbd"',
        output: '"bb"'
      },
      {
        input: '"a"',
        output: '"a"'
      },
      {
        input: '"racecar"',
        output: '"racecar"'
      }
    ],
    solutionHint: 'Consider expanding around centers approach. For each position, expand outward to find palindromes.',
    languages: ['Python', 'Java']
  },
  {
    id: '9',
    title: 'LRU Cache',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design'],
    description: `
Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.
    `,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: `
LRUCache lRUCache = new LRUCache(2);
lRUCache.put(1, 1); // cache is {1=1}
lRUCache.put(2, 2); // cache is {1=1, 2=2}
lRUCache.get(1);    // return 1
lRUCache.put(3, 3); // LRU key was 2, evicts key 2, cache is {1=1, 3=3}
lRUCache.get(2);    // returns -1 (not found)
lRUCache.put(4, 4); // LRU key was 1, evicts key 1, cache is {4=4, 3=3}
lRUCache.get(1);    // return -1 (not found)
lRUCache.get(3);    // return 3
lRUCache.get(4);    // return 4`
      }
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    testCases: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]'
      },
      {
        input: '["LRUCache","put","get"]\n[[1],[2,1],[2]]',
        output: '[null,null,1]'
      }
    ],
    solutionHint: 'Consider using a combination of a hash map and a doubly linked list to achieve O(1) time complexity for both operations.',
    languages: ['Python', 'Java']
  },
  {
    id: '10',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    description: `
Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.
    `,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4'
    ],
    testCases: [
      {
        input: '[[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]'
      },
      {
        input: '[[1,4],[4,5]]',
        output: '[[1,5]]'
      },
      {
        input: '[[1,4],[0,4]]',
        output: '[[0,4]]'
      },
      {
        input: '[[1,4],[2,3]]',
        output: '[[1,4]]'
      }
    ],
    solutionHint: 'First sort the intervals by start time, then merge overlapping intervals by comparing the current interval with the last merged interval.',
    languages: ['Python', 'Java']
  }
];
