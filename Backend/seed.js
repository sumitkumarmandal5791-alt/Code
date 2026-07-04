require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/Modles/problem");

const problems = [
    // ─────────────────────────── 1. Two Sum ───────────────────────────
    {
        title: "Two Sum",
        description:
            "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```\n\n**Constraints:**\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
        difficulty: "easy",
        tags: ["array", "hash-table"],
        visibleTestCases: [
            {
                input: "[2,7,11,15]\n9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
            },
            {
                input: "[3,2,4]\n6",
                output: "[1,2]",
                explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
            },
        ],
        hiddenTestCases: [
            { input: "[3,3]\n6", output: "[0,1]" },
            { input: "[1,5,3,7]\n8", output: "[1,2]" },
            { input: "[-1,-2,-3,-4,-5]\n-8", output: "[2,4]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); ++i) {
            int comp = target - nums[i];
            if (mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    line1.erase(remove(line1.begin(), line1.end(), '['), line1.end());
    line1.erase(remove(line1.begin(), line1.end(), ']'), line1.end());
    stringstream ss(line1);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) nums.push_back(stoi(seg));
    int target = stoi(line2);
    Solution sol;
    vector<int> res = sol.twoSum(nums, target);
    cout << "[" << res[0] << "," << res[1] << "]" << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        int target = Integer.parseInt(sc.nextLine().trim());
        String[] parts = line1.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        int[] res = new Solution().twoSum(nums, target);
        System.out.println("[" + res[0] + "," + res[1] + "]");
    }
}`,
            },
            {
                language: "javascript",
                code:
`var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) return [map.get(comp), i];
        map.set(nums[i], i);
    }
    return [];
};

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
const result = twoSum(nums, target);
console.log(JSON.stringify(result));`,
            },
        ],
    },

    // ─────────────────────────── 2. Reverse Linked List ───────────────────────────
    {
        title: "Reverse Linked List",
        description:
            "Given the `head` of a singly linked list, reverse the list, and return the reversed list.\n\n**Example 1:**\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```\n\n**Constraints:**\n- The number of nodes in the list is the range [0, 5000].\n- -5000 <= Node.val <= 5000",
        difficulty: "easy",
        tags: ["linked-list", "recursion"],
        visibleTestCases: [
            {
                input: "[1,2,3,4,5]",
                output: "[5,4,3,2,1]",
                explanation: "The linked list 1->2->3->4->5 is reversed to 5->4->3->2->1.",
            },
            {
                input: "[1,2]",
                output: "[2,1]",
                explanation: "The linked list 1->2 is reversed to 2->1.",
            },
        ],
        hiddenTestCases: [
            { input: "[]", output: "[]" },
            { input: "[1]", output: "[1]" },
            { input: "[1,2,3]", output: "[3,2,1]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr) {
            ListNode* nxt = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }
};

int main() {
    string line;
    getline(cin, line);
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    ListNode dummy;
    ListNode* tail = &dummy;
    if (!line.empty()) {
        stringstream ss(line);
        string seg;
        while (getline(ss, seg, ',')) {
            tail->next = new ListNode(stoi(seg));
            tail = tail->next;
        }
    }
    Solution sol;
    ListNode* res = sol.reverseList(dummy.next);
    cout << "[";
    bool first = true;
    while (res) {
        if (!first) cout << ",";
        cout << res->val;
        first = false;
        res = res->next;
    }
    cout << "]" << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "").trim();
        ListNode dummy = new ListNode(), tail = dummy;
        if (!line.isEmpty()) {
            for (String s : line.split(",")) {
                tail.next = new ListNode(Integer.parseInt(s.trim()));
                tail = tail.next;
            }
        }
        ListNode res = new Solution().reverseList(dummy.next);
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        while (res != null) {
            if (!first) sb.append(",");
            sb.append(res.val);
            first = false;
            res = res.next;
        }
        sb.append("]");
        System.out.println(sb);
    }
}`,
            },
            {
                language: "javascript",
                code:
`function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val);
    this.next = (next===undefined ? null : next);
}

var reverseList = function(head) {
    let prev = null, curr = head;
    while (curr) {
        let nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
};

const line = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const arr = JSON.parse(line.length > 2 ? line : '[]');
let dummy = new ListNode(), tail = dummy;
for (const v of arr) { tail.next = new ListNode(v); tail = tail.next; }
let res = reverseList(dummy.next);
const out = [];
while (res) { out.push(res.val); res = res.next; }
console.log(JSON.stringify(out));`,
            },
        ],
    },

    // ─────────────────────────── 3. Valid Parentheses ───────────────────────────
    {
        title: "Valid Parentheses",
        description:
            "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.\n\n**Example 1:**\n```\nInput: s = \"()\"\nOutput: true\n```\n\n**Constraints:**\n- 1 <= s.length <= 10^4\n- `s` consists of parentheses only `'()[]{}'`.",
        difficulty: "easy",
        tags: ["string", "stack"],
        visibleTestCases: [
            { input: "()", output: "true", explanation: "Single pair of parentheses is valid." },
            { input: "()[]{}", output: "true", explanation: "All bracket types closed correctly." },
            { input: "(]", output: "false", explanation: "Mismatched bracket types." },
        ],
        hiddenTestCases: [
            { input: "([)]", output: "false" },
            { input: "{[]}", output: "true" },
            { input: "(((", output: "false" },
            { input: "((()))", output: "true" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    bool isValid(string s) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public boolean isValid(String s) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <stack>
#include <string>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                char top = st.top(); st.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return st.empty();
    }
};

int main() {
    string s;
    getline(cin, s);
    cout << (new Solution())->isValid(s) ? "true" : "false") << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine().trim();
        System.out.println(new Solution().isValid(s));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var isValid = function(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const c of s) {
        if ('({['.includes(c)) stack.push(c);
        else {
            if (!stack.length || stack.pop() !== map[c]) return false;
        }
    }
    return stack.length === 0;
};

const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
console.log(isValid(s));`,
            },
        ],
    },

    // ─────────────────────────── 4. Maximum Subarray ───────────────────────────
    {
        title: "Maximum Subarray",
        description:
            "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\n**Example 1:**\n```\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.\n```\n\n**Constraints:**\n- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4",
        difficulty: "medium",
        tags: ["array", "dynamic-programming", "divide-and-conquer"],
        visibleTestCases: [
            {
                input: "[-2,1,-3,4,-1,2,1,-5,4]",
                output: "6",
                explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
            },
            {
                input: "[1]",
                output: "1",
                explanation: "Single element array, max subarray sum is the element itself.",
            },
        ],
        hiddenTestCases: [
            { input: "[5,4,-1,7,8]", output: "23" },
            { input: "[-1]", output: "-1" },
            { input: "[-2,-1]", output: "-1" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int maxSubArray(int[] nums) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = INT_MIN, curSum = 0;
        for (int n : nums) {
            curSum = max(n, curSum + n);
            maxSum = max(maxSum, curSum);
        }
        return maxSum;
    }
};

int main() {
    string line;
    getline(cin, line);
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    stringstream ss(line);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) nums.push_back(stoi(seg));
    Solution sol;
    cout << sol.maxSubArray(nums) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = Integer.MIN_VALUE, curSum = 0;
        for (int n : nums) {
            curSum = Math.max(n, curSum + n);
            maxSum = Math.max(maxSum, curSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        System.out.println(new Solution().maxSubArray(nums));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var maxSubArray = function(nums) {
    let maxSum = -Infinity, curSum = 0;
    for (const n of nums) {
        curSum = Math.max(n, curSum + n);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
};

const nums = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
console.log(maxSubArray(nums));`,
            },
        ],
    },

    // ─────────────────────────── 5. Merge Two Sorted Lists ───────────────────────────
    {
        title: "Merge Two Sorted Lists",
        description:
            "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.\n\n**Example 1:**\n```\nInput: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]\n```\n\n**Constraints:**\n- The number of nodes in both lists is in the range [0, 50].\n- -100 <= Node.val <= 100\n- Both lists are sorted in non-decreasing order.",
        difficulty: "easy",
        tags: ["linked-list", "recursion"],
        visibleTestCases: [
            {
                input: "[1,2,4]\n[1,3,4]",
                output: "[1,1,2,3,4,4]",
                explanation: "Merging [1,2,4] and [1,3,4] yields [1,1,2,3,4,4].",
            },
            {
                input: "[]\n[]",
                output: "[]",
                explanation: "Two empty lists merge to an empty list.",
            },
        ],
        hiddenTestCases: [
            { input: "[]\n[0]", output: "[0]" },
            { input: "[1,3,5]\n[2,4,6]", output: "[1,2,3,4,5,6]" },
            { input: "[5]\n[1,2,3]", output: "[1,2,3,5]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <sstream>
#include <vector>
#include <algorithm>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        ListNode dummy;
        ListNode* tail = &dummy;
        while (l1 && l2) {
            if (l1->val <= l2->val) { tail->next = l1; l1 = l1->next; }
            else { tail->next = l2; l2 = l2->next; }
            tail = tail->next;
        }
        tail->next = l1 ? l1 : l2;
        return dummy.next;
    }
};

ListNode* buildList(const string& line) {
    string s = line;
    s.erase(remove(s.begin(), s.end(), '['), s.end());
    s.erase(remove(s.begin(), s.end(), ']'), s.end());
    ListNode dummy;
    ListNode* tail = &dummy;
    if (!s.empty()) {
        stringstream ss(s);
        string seg;
        while (getline(ss, seg, ',')) {
            tail->next = new ListNode(stoi(seg));
            tail = tail->next;
        }
    }
    return dummy.next;
}

int main() {
    string l1, l2;
    getline(cin, l1);
    getline(cin, l2);
    Solution sol;
    ListNode* res = sol.mergeTwoLists(buildList(l1), buildList(l2));
    cout << "[";
    bool first = true;
    while (res) {
        if (!first) cout << ",";
        cout << res->val;
        first = false;
        res = res->next;
    }
    cout << "]" << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
}

class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(), tail = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
            else { tail.next = l2; l2 = l2.next; }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;
        return dummy.next;
    }

    static ListNode buildList(String line) {
        line = line.replaceAll("[\\\\[\\\\]]", "").trim();
        ListNode dummy = new ListNode(), tail = dummy;
        if (!line.isEmpty()) {
            for (String s : line.split(",")) {
                tail.next = new ListNode(Integer.parseInt(s.trim()));
                tail = tail.next;
            }
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ListNode l1 = buildList(sc.nextLine());
        ListNode l2 = buildList(sc.nextLine());
        ListNode res = new Solution().mergeTwoLists(l1, l2);
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        while (res != null) {
            if (!first) sb.append(",");
            sb.append(res.val);
            first = false;
            res = res.next;
        }
        sb.append("]");
        System.out.println(sb);
    }
}`,
            },
            {
                language: "javascript",
                code:
`function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val);
    this.next = (next===undefined ? null : next);
}

var mergeTwoLists = function(l1, l2) {
    let dummy = new ListNode(), tail = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
        else { tail.next = l2; l2 = l2.next; }
        tail = tail.next;
    }
    tail.next = l1 || l2;
    return dummy.next;
};

function buildList(arr) {
    let dummy = new ListNode(), tail = dummy;
    for (const v of arr) { tail.next = new ListNode(v); tail = tail.next; }
    return dummy.next;
}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const l1 = buildList(JSON.parse(lines[0] || '[]'));
const l2 = buildList(JSON.parse(lines[1] || '[]'));
let res = mergeTwoLists(l1, l2);
const out = [];
while (res) { out.push(res.val); res = res.next; }
console.log(JSON.stringify(out));`,
            },
        ],
    },

    // ─────────────────────────── 6. Best Time to Buy and Sell Stock ───────────────────────────
    {
        title: "Best Time to Buy and Sell Stock",
        description:
            "You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.\n\n**Example 1:**\n```\nInput: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.\n```\n\n**Constraints:**\n- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4",
        difficulty: "easy",
        tags: ["array", "dynamic-programming"],
        visibleTestCases: [
            {
                input: "[7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5.",
            },
            {
                input: "[7,6,4,3,1]",
                output: "0",
                explanation: "No profitable transaction is possible.",
            },
        ],
        hiddenTestCases: [
            { input: "[1,2]", output: "1" },
            { input: "[2,4,1]", output: "2" },
            { input: "[3,3,3,3]", output: "0" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int maxProfit(int[] prices) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, maxProfit = 0;
        for (int p : prices) {
            minPrice = min(minPrice, p);
            maxProfit = max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
};

int main() {
    string line;
    getline(cin, line);
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    stringstream ss(line);
    string seg;
    vector<int> prices;
    while (getline(ss, seg, ',')) prices.push_back(stoi(seg));
    cout << Solution().maxProfit(prices) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int p : prices) {
            minPrice = Math.min(minPrice, p);
            maxProfit = Math.max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] prices = new int[parts.length];
        for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i].trim());
        System.out.println(new Solution().maxProfit(prices));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var maxProfit = function(prices) {
    let minPrice = Infinity, maxProfit = 0;
    for (const p of prices) {
        minPrice = Math.min(minPrice, p);
        maxProfit = Math.max(maxProfit, p - minPrice);
    }
    return maxProfit;
};

const prices = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
console.log(maxProfit(prices));`,
            },
        ],
    },

    // ─────────────────────────── 7. Climbing Stairs ───────────────────────────
    {
        title: "Climbing Stairs",
        description:
            "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\n**Example 1:**\n```\nInput: n = 2\nOutput: 2\nExplanation: There are two ways: 1+1 and 2.\n```\n\n**Example 2:**\n```\nInput: n = 3\nOutput: 3\nExplanation: There are three ways: 1+1+1, 1+2, and 2+1.\n```\n\n**Constraints:**\n- 1 <= n <= 45",
        difficulty: "easy",
        tags: ["math", "dynamic-programming", "memoization"],
        visibleTestCases: [
            { input: "2", output: "2", explanation: "Two ways: 1+1 and 2." },
            { input: "3", output: "3", explanation: "Three ways: 1+1+1, 1+2, and 2+1." },
        ],
        hiddenTestCases: [
            { input: "1", output: "1" },
            { input: "5", output: "8" },
            { input: "10", output: "89" },
            { input: "45", output: "1836311903" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int climbStairs(int n) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int climbStairs(int n) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
using namespace std;

class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = b;
            b = a + b;
            a = temp;
        }
        return b;
    }
};

int main() {
    int n;
    cin >> n;
    cout << Solution().climbStairs(n) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = b;
            b = a + b;
            a = temp;
        }
        return b;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(new Solution().climbStairs(n));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var climbStairs = function(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
};

const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
console.log(climbStairs(n));`,
            },
        ],
    },

    // ─────────────────────────── 8. Binary Search ───────────────────────────
    {
        title: "Binary Search",
        description:
            "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.\n\n**Example 1:**\n```\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4.\n```\n\n**Constraints:**\n- 1 <= nums.length <= 10^4\n- -10^4 < nums[i], target < 10^4\n- All integers in nums are unique.\n- nums is sorted in ascending order.",
        difficulty: "easy",
        tags: ["array", "binary-search"],
        visibleTestCases: [
            {
                input: "[-1,0,3,5,9,12]\n9",
                output: "4",
                explanation: "9 exists in nums and its index is 4.",
            },
            {
                input: "[-1,0,3,5,9,12]\n2",
                output: "-1",
                explanation: "2 does not exist in nums so return -1.",
            },
        ],
        hiddenTestCases: [
            { input: "[5]\n5", output: "0" },
            { input: "[2,5]\n5", output: "1" },
            { input: "[1,2,3,4,5,6,7,8,9,10]\n10", output: "9" },
            { input: "[1,2,3,4,5]\n6", output: "-1" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int search(int[] nums, int target) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int lo = 0, hi = nums.size() - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }
};

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    line1.erase(remove(line1.begin(), line1.end(), '['), line1.end());
    line1.erase(remove(line1.begin(), line1.end(), ']'), line1.end());
    stringstream ss(line1);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) nums.push_back(stoi(seg));
    int target = stoi(line2);
    cout << Solution().search(nums, target) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        int target = Integer.parseInt(sc.nextLine().trim());
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        System.out.println(new Solution().search(nums, target));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var search = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
};

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);
console.log(search(nums, target));`,
            },
        ],
    },

    // ─────────────────────────── 9. Longest Common Subsequence ───────────────────────────
    {
        title: "Longest Common Subsequence",
        description:
            "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.\n\n**Example 1:**\n```\nInput: text1 = \"abcde\", text2 = \"ace\"\nOutput: 3\nExplanation: The longest common subsequence is \"ace\" and its length is 3.\n```\n\n**Constraints:**\n- 1 <= text1.length, text2.length <= 1000\n- text1 and text2 consist of only lowercase English characters.",
        difficulty: "medium",
        tags: ["string", "dynamic-programming"],
        visibleTestCases: [
            {
                input: "abcde\nace",
                output: "3",
                explanation: 'The longest common subsequence is "ace" and its length is 3.',
            },
            {
                input: "abc\nabc",
                output: "3",
                explanation: 'The longest common subsequence is "abc" and its length is 3.',
            },
        ],
        hiddenTestCases: [
            { input: "abc\ndef", output: "0" },
            { input: "bsbininm\njmjkbkjkv", output: "1" },
            { input: "oxcpqrsvwf\nshmtulqrypy", output: "2" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
var longestCommonSubsequence = function(text1, text2) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int m = text1.size(), n = text2.size();
        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1[i-1] == text2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[m][n];
    }
};

int main() {
    string t1, t2;
    getline(cin, t1);
    getline(cin, t2);
    cout << Solution().longestCommonSubsequence(t1, t2) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i-1) == text2.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;
                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[m][n];
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String t1 = sc.nextLine().trim();
        String t2 = sc.nextLine().trim();
        System.out.println(new Solution().longestCommonSubsequence(t1, t2));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var longestCommonSubsequence = function(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = Array.from({length: m + 1}, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i-1] === text2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
            else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
};

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
console.log(longestCommonSubsequence(lines[0], lines[1]));`,
            },
        ],
    },

    // ─────────────────────────── 10. Container With Most Water ───────────────────────────
    {
        title: "Container With Most Water",
        description:
            "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the ith line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\n**Notice** that you may not slant the container.\n\n**Example 1:**\n```\nInput: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\nExplanation: The max area is between index 1 and 8: min(8,7) * (8-1) = 49.\n```\n\n**Constraints:**\n- n == height.length\n- 2 <= n <= 10^5\n- 0 <= height[i] <= 10^4",
        difficulty: "medium",
        tags: ["array", "two-pointers", "greedy"],
        visibleTestCases: [
            {
                input: "[1,8,6,2,5,4,8,3,7]",
                output: "49",
                explanation: "The max area is between index 1 and 8: min(8,7) * (8-1) = 49.",
            },
            {
                input: "[1,1]",
                output: "1",
                explanation: "The only container has area = min(1,1) * 1 = 1.",
            },
        ],
        hiddenTestCases: [
            { input: "[4,3,2,1,4]", output: "16" },
            { input: "[1,2,1]", output: "2" },
            { input: "[1,8,6,2,5,4,8,3,7]", output: "49" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
`class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your code here
    }
};`,
            },
            {
                language: "java",
                initialCode:
`class Solution {
    public int maxArea(int[] height) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
`/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    // Write your code here
};`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
`#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, ans = 0;
        while (l < r) {
            ans = max(ans, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return ans;
    }
};

int main() {
    string line;
    getline(cin, line);
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    stringstream ss(line);
    string seg;
    vector<int> h;
    while (getline(ss, seg, ',')) h.push_back(stoi(seg));
    cout << Solution().maxArea(h) << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
`import java.util.*;

class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, ans = 0;
        while (l < r) {
            ans = Math.max(ans, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return ans;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] h = new int[parts.length];
        for (int i = 0; i < parts.length; i++) h[i] = Integer.parseInt(parts[i].trim());
        System.out.println(new Solution().maxArea(h));
    }
}`,
            },
            {
                language: "javascript",
                code:
`var maxArea = function(height) {
    let l = 0, r = height.length - 1, ans = 0;
    while (l < r) {
        ans = Math.max(ans, Math.min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return ans;
};

const h = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
console.log(maxArea(h));`,
            },
        ],
    },
];

// ─────────────────────────── Seed Runner ───────────────────────────

async function seed() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("✅ Connected to MongoDB");

        // Clear existing problems
        const deleted = await Problem.deleteMany({});
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing problems`);

        // Insert all problems
        const inserted = await Problem.insertMany(problems);
        console.log(`🌱 Seeded ${inserted.length} problems successfully!\n`);

        // Print summary
        inserted.forEach((p, i) => {
            console.log(
                `  ${i + 1}. ${p.title} [${p.difficulty}] — ${p.tags.join(", ")} — ${p.startCode.length} languages`
            );
        });

    } catch (error) {
        console.error("❌ Error seeding data:", error.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n🔌 Connection closed");
    }
}

seed();
