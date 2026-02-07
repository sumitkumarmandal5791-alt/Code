require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./src/Modles/problem");

const sampleProblem = {
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    tags: ["array", "hash-table"],
    visibleTestCases: [
        {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
    ],
    hiddenTestCases: [
        {
            input: "nums = [3,2,4], target = 6",
            output: "[1,2]"
        }
    ],
    startCode: [
        {
            language: "cpp",
            initialCode: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
        }
    ],
    referenceSolution: [
        {
            language: "cpp",
            code: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>
#include <algorithm>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (numMap.count(complement)) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i; // Store index
        }
        return {};
    }
};

// Driver code to handle input/output
int main() {
    string inputLine1, inputLine2;
    getline(cin, inputLine1); // Read nums (e.g., "[2,7,11,15]")
    getline(cin, inputLine2); // Read target (e.g., "9")
    
    // Parse nums
    inputLine1.erase(remove(inputLine1.begin(), inputLine1.end(), '['), inputLine1.end());
    inputLine1.erase(remove(inputLine1.begin(), inputLine1.end(), ']'), inputLine1.end());
    stringstream ss(inputLine1);
    string segment;
    vector<int> nums;
    while(getline(ss, segment, ',')) {
        nums.push_back(stoi(segment));
    }
    
    // Parse target
    int target = stoi(inputLine2);
    
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    
    // Output result
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    
    return 0;
}`
        }
    ]
};

async function seed() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log("Connected to MongoDB");

        const problem = new Problem(sampleProblem);
        await problem.save();
        console.log("Sample problem inserted successfully!");

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Connection closed");
    }
}

seed();
