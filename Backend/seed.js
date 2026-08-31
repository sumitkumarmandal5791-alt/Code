require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/Modles/problem");

const problems = [

    // ─────────────────────────── 1. Two Sum ───────────────────────────
    {
        title: "Two Sum",
        description:
            "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
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
            { input: "[0,4,3,0]\n0", output: "[0,3]" },
            { input: "[-10,12,-5,30,15]\n10", output: "[2,4]" },
            { input: "[1,2,3,4,5,6,7,100]\n107", output: "[6,7]" },
            { input: "[10,20,30,40,50,60]\n100", output: "[3,5]" },
            { input: "[2,5,9,11,3]\n8", output: "[1,4]" },
            { input: "[1000000000,-1000000000,0]\n0", output: "[0,1]" },
            { input: "[5,25,75,10,12]\n100", output: "[1,2]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include<bits/stdc++.h>
using namespace std;

int main() {
    string line1;
    int target;
    if (!(cin >> line1 >> target)) return 0;

    // Parse the bracketed string format e.g., [2,7,11,15]
    line1.erase(remove(line1.begin(), line1.end(), '['), line1.end());
    line1.erase(remove(line1.begin(), line1.end(), ']'), line1.end());
    
    stringstream ss(line1);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) {
        nums.push_back(stoi(seg));
    }

    unordered_map<int, int> mp;
    vector<int> res;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (mp.count(comp)) {
            res = {mp[comp], i};
            break;
        }
        mp[nums[i]] = i;
    }

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
        if (!sc.hasNextLine()) return;
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
            {
                language: "python",
                code:
                    `import sys
import json

def twoSum(nums, target):
    mapping = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in mapping:
            return [mapping[comp], i]
        mapping[num] = i
    return []

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    nums = json.loads(input_data[0])
    target = int(input_data[1].strip())
    result = twoSum(nums, target)
    print(json.dumps(result).replace(" ", ""))

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 2. Reverse Linked List ───────────────────────────
    {
        title: "Reverse Linked List",
        description:
            "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
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
            { input: "[10,20,30,40]", output: "[40,30,20,10]" },
            { input: "[5,5,5]", output: "[5,5,5]" },
            { input: "[-1,-2,-3]", output: "[-3,-2,-1]" },
            { input: "[1,2,3,4,5,6,7,8,9,10]", output: "[10,9,8,7,6,5,4,3,2,1]" },
            { input: "[100]", output: "[100]" },
            { input: "[0,1,0]", output: "[0,1,0]" },
            { input: "[1,3,5,7,9]", output: "[9,7,5,3,1]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
};

int main() {
    string line;
    if (!(cin >> line)) return 0;
    
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
    
    ListNode* prev = nullptr;
    ListNode* curr = dummy.next;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    
    cout << "[";
    bool first = true;
    while (prev) {
        if (!first) cout << ",";
        cout << prev->val;
        first = false;
        prev = prev->next;
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

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "").trim();
        ListNode dummy = new ListNode(), tail = dummy;
        if (!line.isEmpty()) {
            for (String s : line.split(",")) {
                tail.next = new ListNode(Integer.parseInt(s.trim()));
                tail = tail.next;
            }
        }
        
        ListNode prev = null, curr = dummy.next;
        while (curr != null) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        while (prev != null) {
            if (!first) sb.append(",");
            sb.append(prev.val);
            first = false;
            prev = prev.next;
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

const line = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const arr = JSON.parse(line.length > 2 ? line : '[]');
let dummy = new ListNode(), tail = dummy;
for (const v of arr) { tail.next = new ListNode(v); tail = tail.next; }

let prev = null, curr = dummy.next;
while (curr) {
    let nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
}

const out = [];
while (prev) { out.push(prev.val); prev = prev.next; }
console.log(JSON.stringify(out));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    arr = json.loads(input_data)
    
    dummy = ListNode()
    tail = dummy
    for v in arr:
        tail.next = ListNode(v)
        tail = tail.next
        
    prev = None
    curr = dummy.next
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
        
    out = []
    while prev:
        out.append(prev.val)
        prev = prev.next
    print(json.dumps(out).replace(" ", ""))

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 3. Valid Parentheses ───────────────────────────
    {
        title: "Valid Parentheses",
        description:
            "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
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
            { input: "]", output: "false" },
            { input: "[", output: "false" },
            { input: "([]){}", output: "true" },
            { input: "{[()]}", output: "true" },
            { input: "(((((((())))))))", output: "true" },
            { input: "(((((((()))))))", output: "false" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    if (!(cin >> s)) return 0;
    
    stack<char> st;
    bool valid = true;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) {
                valid = false;
                break;
            }
            char top = st.top(); 
            st.pop();
            if ((c == ')' && top != '(') || 
                (c == '}' && top != '{') || 
                (c == ']' && top != '[')) {
                valid = false;
                break;
            }
        }
    }
    if (!st.empty()) valid = false;
    
    cout << (valid ? "true" : "false") << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        String s = sc.nextLine().trim();
        
        Stack<Character> stack = new Stack<>();
        boolean valid = true;
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) {
                    valid = false;
                    break;
                }
                char top = stack.pop();
                if ((c == ')' && top != '(') || 
                    (c == '}' && top != '{') || 
                    (c == ']' && top != '[')) {
                    valid = false;
                    break;
                }
            }
        }
        if (!stack.isEmpty()) valid = false;
        
        System.out.println(valid ? "true" : "false");
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

var isValid = function(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const c of s) {
        if ('({['.includes(c)) {
            stack.push(c);
        } else {
            if (!stack.length || stack.pop() !== map[c]) return false;
        }
    }
    return stack.length === 0;
};

console.log(isValid(s) ? "true" : "false");`,
            },
            {
                language: "python",
                code:
                    `import sys

def isValid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            return False
    return len(stack) == 0

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    print("true" if isValid(line) else "false")

if __name__ == '__main__':
    main()`,
            },
        ],
    },
    // ─────────────────────────── 4. Maximum Subarray ───────────────────────────
    {
        title: "Maximum Subarray",
        description:
            "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
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
            { input: "[-1,-2,-3,-4]", output: "-1" },
            { input: "[1,2,3,4,5]", output: "15" },
            { input: "[-5,8,-2,3,-6,9,-1]", output: "12" },
            { input: "[-10000]", output: "-10000" },
            { input: "[10,-2,3,4,-1,5]", output: "19" },
            { input: "[-2,1]", output: "1" },
            { input: "[2,3,-2,4,-1]", output: "7" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    if (!(cin >> line)) return 0;
    
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    
    stringstream ss(line);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) {
        nums.push_back(stoi(seg));
    }
    
    int maxSum = INT_MIN, curSum = 0;
    for (int n : nums) {
        curSum = max(n, curSum + n);
        maxSum = max(maxSum, curSum);
    }
    
    cout << maxSum << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        
        int maxSum = Integer.MIN_VALUE, curSum = 0;
        for (int n : nums) {
            curSum = Math.max(n, curSum + n);
            maxSum = Math.max(maxSum, curSum);
        }
        System.out.println(maxSum);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const nums = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

var maxSubArray = function(nums) {
    let maxSum = -Infinity, curSum = 0;
    for (const n of nums) {
        curSum = Math.max(n, curSum + n);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
};

console.log(maxSubArray(nums));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    nums = json.loads(input_data)
    
    max_sum = float('-inf')
    cur_sum = 0
    for n in nums:
        cur_sum = max(n, cur_sum + n)
        max_sum = max(max_sum, cur_sum)
        
    print(max_sum)

if __name__ == '__main__':
    main()`,
            },
        ],
    },
    // ─────────────────────────── 5. Merge Two Sorted Lists ───────────────────────────
    {
        title: "Merge Two Sorted Lists",
        description:
            "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
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
            { input: "[1,2,3]\n[]", output: "[1,2,3]" },
            { input: "[1,5,9]\n[2,3,4,6,7,8,10]", output: "[1,2,3,4,5,6,7,8,9,10]" },
            { input: "[-10,-5,0]\n[-3,1,2]", output: "[-10,-5,-3,0,1,2]" },
            { input: "[1]\n[1]", output: "[1,1]" },
            { input: "[4,4,4]\n[4,4,4]", output: "[4,4,4,4,4,4]" },
            { input: "[1,2,3]\n[4,5,6]", output: "[1,2,3,4,5,6]" },
            { input: "[10,20]\n[5,15,25]", output: "[5,10,15,20,25]" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
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
    string line1, line2;
    if (!(cin >> line1 >> line2)) return 0;
    
    ListNode* l1 = buildList(line1);
    ListNode* l2 = buildList(line2);
    
    ListNode dummy;
    ListNode* tail = &dummy;
    while (l1 && l2) {
        if (l1->val <= l2->val) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    
    ListNode* res = dummy.next;
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

public class Main {
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
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        ListNode l1 = buildList(sc.nextLine());
        if (!sc.hasNextLine()) return;
        ListNode l2 = buildList(sc.nextLine());
        
        ListNode dummy = new ListNode(), tail = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;
        }
        tail.next = (l1 != null) ? l1 : l2;
        
        ListNode res = dummy.next;
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

function buildList(arr) {
    let dummy = new ListNode(), tail = dummy;
    for (const v of arr) { tail.next = new ListNode(v); tail = tail.next; }
    return dummy.next;
}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const l1 = buildList(JSON.parse(lines[0] || '[]'));
const l2 = buildList(JSON.parse(lines[1] || '[]'));

let dummy = new ListNode(), tail = dummy;
let ptr1 = l1, ptr2 = l2;
while (ptr1 && ptr2) {
    if (ptr1.val <= ptr2.val) {
        tail.next = ptr1;
        ptr1 = ptr1.next;
    } else {
        tail.next = ptr2;
        ptr2 = ptr2.next;
    }
    tail = tail.next;
}
tail.next = ptr1 || ptr2;

let res = dummy.next;
const out = [];
while (res) { out.push(res.val); res = res.next; }
console.log(JSON.stringify(out));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(arr):
    dummy = ListNode()
    tail = dummy
    for v in arr:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    
    l1 = build_list(json.loads(input_data[0]) if input_data[0].strip() else [])
    l2 = build_list(json.loads(input_data[1]) if len(input_data) > 1 and input_data[1].strip() else [])
    
    dummy = ListNode()
    tail = dummy
    
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1 = l1.next
        else:
            tail.next = l2
            l2 = l2.next
        tail = tail.next
        
    tail.next = l1 if l1 else l2
    
    res = dummy.next
    out = []
    while res:
        out.append(res.val)
        res = res.next
    print(json.dumps(out).replace(" ", ""))

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 6. Best Time to Buy and Sell Stock ───────────────────────────
    {
        title: "Best Time to Buy and Sell Stock",
        description:
            "You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
        difficulty: "easy",
        tags: ["array", "dynamic-programming"],
        visibleTestCases: [
            {
                input: "[7,1,5,3,6,4]",
                output: "5",
                explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
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
            { input: "[1,2,3,4,5]", output: "4" },
            { input: "[5,4,3,2,1]", output: "0" },
            { input: "[2,1,2,1,0,1,2]", output: "2" },
            { input: "[10,20,30,40,50,60]", output: "50" },
            { input: "[3,2,6,5,0,3]", output: "4" },
            { input: "[1,10,1,10,1,10]", output: "9" },
            { input: "[100,10,20,5,15,30]", output: "25" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    if (!(cin >> line)) return 0;
    
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    
    stringstream ss(line);
    string seg;
    vector<int> prices;
    while (getline(ss, seg, ',')) {
        prices.push_back(stoi(seg));
    }
    
    int minPrice = INT_MAX, maxProfit = 0;
    for (int p : prices) {
        minPrice = min(minPrice, p);
        maxProfit = max(maxProfit, p - minPrice);
    }
    
    cout << maxProfit << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] prices = new int[parts.length];
        for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i].trim());
        
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int p : prices) {
            minPrice = Math.min(minPrice, p);
            maxProfit = Math.max(maxProfit, p - minPrice);
        }
        System.out.println(maxProfit);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const prices = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

var maxProfit = function(prices) {
    let minPrice = Infinity, maxProfit = 0;
    for (const p of prices) {
        minPrice = Math.min(minPrice, p);
        maxProfit = Math.max(maxProfit, p - minPrice);
    }
    return maxProfit;
};

console.log(maxProfit(prices));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    prices = json.loads(input_data)
    
    min_price = float('inf')
    max_profit = 0
    for p in prices:
        min_price = min(min_price, p)
        max_profit = max(max_profit, p - min_price)
        
    print(max_profit)

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 7. Climbing Stairs ───────────────────────────
    {
        title: "Climbing Stairs",
        description:
            "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
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
            { input: "4", output: "5" },
            { input: "6", output: "13" },
            { input: "7", output: "21" },
            { input: "8", output: "34" },
            { input: "20", output: "10946" },
            { input: "30", output: "1346269" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    
    if (n <= 2) {
        cout << n << endl;
        return 0;
    }
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int temp = b;
        b = a + b;
        a = temp;
    }
    cout << b << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        
        if (n <= 2) {
            System.out.println(n);
            return;
        }
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int temp = b;
            b = a + b;
            a = temp;
        }
        System.out.println(b);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

var climbStairs = function(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
};

// Simple validation to ensure correct formatting
console.log(climbStairs(n));`,
            },
            {
                language: "python",
                code:
                    `import sys

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    n = int(line)
    
    if n <= 2:
        print(n)
        return
        
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
        
    print(b)

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 8. Binary Search ───────────────────────────
    {
        title: "Binary Search",
        description:
            "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
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
            { input: "[-100,-50,-10,0,10,50,100]\n-10", output: "2" },
            { input: "[-100,-50,-10,0,10,50,100]\n-5", output: "-1" },
            { input: "[1,3,5,7,9,11,13,15]\n1", output: "0" },
            { input: "[1,3,5,7,9,11,13,15]\n15", output: "7" },
            { input: "[2,4,6,8,10]\n5", output: "-1" },
            { input: "[-5,-4,-3,-2,-1]\n-3", output: "2" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string line1;
    int target;
    if (!(cin >> line1 >> target)) return 0;
    
    line1.erase(remove(line1.begin(), line1.end(), '['), line1.end());
    line1.erase(remove(line1.begin(), line1.end(), ']'), line1.end());
    
    stringstream ss(line1);
    string seg;
    vector<int> nums;
    while (getline(ss, seg, ',')) {
        nums.push_back(stoi(seg));
    }
    
    int lo = 0, hi = nums.size() - 1, res = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) {
            res = mid;
            break;
        } else if (nums[mid] < target) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    
    cout << res << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        int target = Integer.parseInt(sc.nextLine().trim());
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i].trim());
        
        int lo = 0, hi = nums.length - 1, res = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) {
                res = mid;
                break;
            } else if (nums[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        System.out.println(res);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const nums = JSON.parse(lines[0]);
const target = parseInt(lines[1]);

var search = function(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (nums[mid] === target) return mid;
        else if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
};

console.log(search(nums, target));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    nums = json.loads(input_data[0])
    target = int(input_data[1].strip())
    
    lo, hi = 0, len(nums) - 1
    res = -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            res = mid
            break
        elif nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
            
    print(res)

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 9. Longest Common Subsequence ───────────────────────────
    {
        title: "Longest Common Subsequence",
        description:
            "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nA subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
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
            { input: "a\na", output: "1" },
            { input: "a\nb", output: "0" },
            { input: "ezupkr\nubmrapg", output: "2" },
            { input: "longest\nstone", output: "3" },
            { input: "aggtab\ngxtxayb", output: "4" },
            { input: "abcde\nfghij", output: "0" },
            { input: "paprika\nappetizer", output: "3" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string t1, t2;
    if (!(cin >> t1 >> t2)) return 0;
    
    int m = t1.size(), n = t2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (t1[i-1] == t2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    cout << dp[m][n] << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        String t1 = sc.nextLine().trim();
        if (!sc.hasNextLine()) return;
        String t2 = sc.nextLine().trim();
        
        int m = t1.length(), n = t2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (t1.charAt(i-1) == t2.charAt(j-1)) dp[i][j] = dp[i-1][j-1] + 1;
                else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
        System.out.println(dp[m][n]);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const text1 = lines[0].trim();
const text2 = lines[1] ? lines[1].trim() : "";

var longestCommonSubsequence = function(text1, text2) {
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

print(longestCommonSubsequence(text1, text2));
function print(val) { console.log(val); }`,
            },
            {
                language: "python",
                code:
                    `import sys

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    text1 = lines[0].strip()
    text2 = lines[1].strip() if len(lines) > 1 else ""
    
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
                
    print(dp[m][n])

if __name__ == '__main__':
    main()`,
            },
        ],
    },

    // ─────────────────────────── 10. Container With Most Water ───────────────────────────
    {
        title: "Container With Most Water",
        description:
            "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the ith line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.\n\n**Notice** that you may not slant the container.",
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
            { input: "[2,3,4,5,18,17,6]", output: "17" },
            { input: "[1,3,2,5,25,24,5]", output: "24" },
            { input: "[10,9,8,7,6,5,4,3,2,1]", output: "25" },
            { input: "[1,2,3,4,5,6,7,8,9,10]", output: "25" },
            { input: "[0,2]", output: "0" },
            { input: "[12,3,5,24,1,3,18,5]", output: "72" },
            { input: "[7,4,9,3,2,8,5,1,6]", output: "42" },
        ],
        startCode: [
            {
                language: "cpp",
                initialCode:
                    `#include<bits/stdc++.h>
using namespace std;

int main(){
    // Write your code here
    return 0;
}
`,
            },
            {
                language: "java",
                initialCode:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
            },
            {
                language: "javascript",
                initialCode:
                    `const fs = require('fs');

// Write your code here
`,
            },
            {
                language: "python",
                initialCode:
                    `import sys

def main():
    # Write your code here
    pass

if __name__ == '__main__':
    main()
`,
            },
        ],
        referenceSolution: [
            {
                language: "cpp",
                code:
                    `#include <bits/stdc++.h>
using namespace std;

int main() {
    string line;
    if (!(cin >> line)) return 0;
    
    line.erase(remove(line.begin(), line.end(), '['), line.end());
    line.erase(remove(line.begin(), line.end(), ']'), line.end());
    
    stringstream ss(line);
    string seg;
    vector<int> height;
    while (getline(ss, seg, ',')) {
        height.push_back(stoi(seg));
    }
    
    int l = 0, r = height.size() - 1, ans = 0;
    while (l < r) {
        ans = max(ans, min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    cout << ans << endl;
    return 0;
}`,
            },
            {
                language: "java",
                code:
                    `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.util);
        if (!sc.hasNextLine()) return;
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i].trim());
        
        int l = 0, r = height.length - 1, ans = 0;
        while (l < r) {
            ans = Math.max(ans, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        System.out.println(ans);
    }
}`,
            },
            {
                language: "javascript",
                code:
                    `const height = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

var maxArea = function(height) {
    let l = 0, r = height.length - 1, ans = 0;
    while (l < r) {
        ans = Math.max(ans, Math.min(height[l], height[r]) * (r - l));
        if (height[l] < height[r]) l++;
        else r--;
    }
    return ans;
};

console.log(maxArea(height));`,
            },
            {
                language: "python",
                code:
                    `import sys
import json

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    height = json.loads(input_data)
    
    l, r = 0, len(height) - 1
    ans = 0
    while l < r:
        ans = max(ans, min(height[l], height[r]) * (r - l))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
            
    print(ans)

if __name__ == '__main__':
    main()`,
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
