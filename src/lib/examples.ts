import type { Language } from './languages'

export interface Example {
  id: string
  title: string
  code: Record<Language, string>
}

export const EXAMPLES: Example[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    code: {
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []


print(two_sum([2, 7, 11, 15], 9))
`,
      javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
`,
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    code: {
      python: `def binary_search(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


print(binary_search([1, 3, 5, 7, 9, 11], 7))
`,
      javascript: `function binarySearch(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));
`,
      typescript: `function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7));
`,
    },
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    code: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev


head = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))
new_head = reverse_list(head)
while new_head:
    print(new_head.val)
    new_head = new_head.next
`,
      javascript: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const nextNode = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  return prev;
}

let head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4))));
let newHead = reverseList(head);
while (newHead) {
  console.log(newHead.val);
  newHead = newHead.next;
}
`,
      typescript: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val: number, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const nextNode: ListNode | null = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nextNode;
  }
  return prev;
}

let head: ListNode | null = new ListNode(
  1,
  new ListNode(2, new ListNode(3, new ListNode(4))),
);
let newHead = reverseList(head);
while (newHead) {
  console.log(newHead.val);
  newHead = newHead.next;
}
`,
    },
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    code: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def merge_two_lists(l1, l2):
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
    return dummy.next


l1 = ListNode(1, ListNode(3, ListNode(5)))
l2 = ListNode(2, ListNode(4, ListNode(6)))
merged = merge_two_lists(l1, l2)
while merged:
    print(merged.val)
    merged = merged.next
`,
      javascript: `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(l1, l2) {
  const dummy = new ListNode();
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return dummy.next;
}

let l1 = new ListNode(1, new ListNode(3, new ListNode(5)));
let l2 = new ListNode(2, new ListNode(4, new ListNode(6)));
let merged = mergeTwoLists(l1, l2);
while (merged) {
  console.log(merged.val);
  merged = merged.next;
}
`,
      typescript: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode();
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return dummy.next;
}

let l1: ListNode | null = new ListNode(1, new ListNode(3, new ListNode(5)));
let l2: ListNode | null = new ListNode(2, new ListNode(4, new ListNode(6)));
let merged = mergeTwoLists(l1, l2);
while (merged) {
  console.log(merged.val);
  merged = merged.next;
}
`,
    },
  },
  {
    id: 'detect-cycle',
    title: 'Detect Cycle',
    code: {
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def has_cycle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False


a = ListNode(1)
b = ListNode(2)
c = ListNode(3)
a.next = b
b.next = c
c.next = a  # creates a cycle

print(has_cycle(a))
`,
      javascript: `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }
  return false;
}

const a = new ListNode(1);
const b = new ListNode(2);
const c = new ListNode(3);
a.next = b;
b.next = c;
c.next = a; // creates a cycle

console.log(hasCycle(a));
`,
      typescript: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

function hasCycle(head: ListNode | null): boolean {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      return true;
    }
  }
  return false;
}

const a = new ListNode(1);
const b = new ListNode(2);
const c = new ListNode(3);
a.next = b;
b.next = c;
c.next = a; // creates a cycle

console.log(hasCycle(a));
`,
    },
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci (recursive)',
    code: {
      python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)


print(fib(5))
`,
      javascript: `function fib(n) {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(5));
`,
      typescript: `function fib(n: number): number {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

console.log(fib(5));
`,
    },
  },
  {
    id: 'factorial',
    title: 'Factorial (recursive)',
    code: {
      python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)


print(factorial(5))
`,
      javascript: `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(5));
`,
      typescript: `function factorial(n: number): number {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(5));
`,
    },
  },
  {
    id: 'inorder-traversal',
    title: 'Binary Tree Inorder Traversal',
    code: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def inorder(node, result):
    if node is None:
        return
    inorder(node.left, result)
    result.append(node.val)
    inorder(node.right, result)


root = TreeNode(2, TreeNode(1), TreeNode(3))
output = []
inorder(root, output)
print(output)
`,
      javascript: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorder(node, result) {
  if (node === null) {
    return;
  }
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output = [];
inorder(root, output);
console.log(output);
`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function inorder(node: TreeNode | null, result: number[]): void {
  if (node === null) {
    return;
  }
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output: number[] = [];
inorder(root, output);
console.log(output);
`,
    },
  },
  {
    id: 'preorder-traversal',
    title: 'Binary Tree Preorder Traversal',
    code: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def preorder(node, result):
    if node is None:
        return
    result.append(node.val)
    preorder(node.left, result)
    preorder(node.right, result)


root = TreeNode(2, TreeNode(1), TreeNode(3))
output = []
preorder(root, output)
print(output)
`,
      javascript: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorder(node, result) {
  if (node === null) {
    return;
  }
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output = [];
preorder(root, output);
console.log(output);
`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function preorder(node: TreeNode | null, result: number[]): void {
  if (node === null) {
    return;
  }
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output: number[] = [];
preorder(root, output);
console.log(output);
`,
    },
  },
  {
    id: 'postorder-traversal',
    title: 'Binary Tree Postorder Traversal',
    code: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def postorder(node, result):
    if node is None:
        return
    postorder(node.left, result)
    postorder(node.right, result)
    result.append(node.val)


root = TreeNode(2, TreeNode(1), TreeNode(3))
output = []
postorder(root, output)
print(output)
`,
      javascript: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function postorder(node, result) {
  if (node === null) {
    return;
  }
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output = [];
postorder(root, output);
console.log(output);
`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function postorder(node: TreeNode | null, result: number[]): void {
  if (node === null) {
    return;
  }
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);
}

const root = new TreeNode(2, new TreeNode(1), new TreeNode(3));
const output: number[] = [];
postorder(root, output);
console.log(output);
`,
    },
  },
  {
    id: 'bst-search',
    title: 'Binary Search Tree Search',
    code: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def search_bst(node, target):
    if node is None:
        return False
    if node.val == target:
        return True
    if target < node.val:
        return search_bst(node.left, target)
    return search_bst(node.right, target)


root = TreeNode(
    5,
    TreeNode(3, TreeNode(1), TreeNode(4)),
    TreeNode(8, TreeNode(7), TreeNode(9)),
)
print(search_bst(root, 7))
`,
      javascript: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function searchBst(node, target) {
  if (node === null) {
    return false;
  }
  if (node.val === target) {
    return true;
  }
  if (target < node.val) {
    return searchBst(node.left, target);
  }
  return searchBst(node.right, target);
}

const root = new TreeNode(
  5,
  new TreeNode(3, new TreeNode(1), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9)),
);
console.log(searchBst(root, 7));
`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function searchBst(node: TreeNode | null, target: number): boolean {
  if (node === null) {
    return false;
  }
  if (node.val === target) {
    return true;
  }
  if (target < node.val) {
    return searchBst(node.left, target);
  }
  return searchBst(node.right, target);
}

const root = new TreeNode(
  5,
  new TreeNode(3, new TreeNode(1), new TreeNode(4)),
  new TreeNode(8, new TreeNode(7), new TreeNode(9)),
);
console.log(searchBst(root, 7));
`,
    },
  },
  {
    id: 'max-depth',
    title: 'Maximum Depth of Binary Tree',
    code: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))


root = TreeNode(1, TreeNode(2, TreeNode(4)), TreeNode(3))
print(max_depth(root))
`,
      javascript: `class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(node) {
  if (node === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(4)), new TreeNode(3));
console.log(maxDepth(root));
`,
      typescript: `class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + Math.max(maxDepth(node.left), maxDepth(node.right));
}

const root = new TreeNode(1, new TreeNode(2, new TreeNode(4)), new TreeNode(3));
console.log(maxDepth(root));
`,
    },
  },
  {
    id: 'graph-bfs',
    title: 'Graph BFS',
    code: {
      python: `def bfs(graph, start):
    visited = {start}
    queue = [start]
    order = []
    while queue:
        node = queue.pop(0)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order


graph = {
    0: [1, 2],
    1: [0, 3],
    2: [0, 3],
    3: [1, 2],
}
print(bfs(graph, 0))
`,
      javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

const graph = {
  0: [1, 2],
  1: [0, 3],
  2: [0, 3],
  3: [1, 2],
};
console.log(bfs(graph, 0));
`,
      typescript: `function bfs(graph: Record<number, number[]>, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue = [start];
  const order: number[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

const graph: Record<number, number[]> = {
  0: [1, 2],
  1: [0, 3],
  2: [0, 3],
  3: [1, 2],
};
console.log(bfs(graph, 0));
`,
    },
  },
  {
    id: 'graph-dfs',
    title: 'Graph DFS',
    code: {
      python: `def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return order


graph = {
    0: [1, 2],
    1: [0, 3],
    2: [0, 3],
    3: [1, 2],
}
print(dfs(graph, 0))
`,
      javascript: `function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) {
      continue;
    }
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  return order;
}

const graph = {
  0: [1, 2],
  1: [0, 3],
  2: [0, 3],
  3: [1, 2],
};
console.log(dfs(graph, 0));
`,
      typescript: `function dfs(graph: Record<number, number[]>, start: number): number[] {
  const visited = new Set<number>();
  const stack = [start];
  const order: number[] = [];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) {
      continue;
    }
    visited.add(node);
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
  return order;
}

const graph: Record<number, number[]> = {
  0: [1, 2],
  1: [0, 3],
  2: [0, 3],
  3: [1, 2],
};
console.log(dfs(graph, 0));
`,
    },
  },
  {
    id: 'connected-components',
    title: 'Connected Components',
    code: {
      python: `def dfs_visit(graph, node, visited):
    stack = [node]
    while stack:
        curr = stack.pop()
        if curr in visited:
            continue
        visited.add(curr)
        for neighbor in graph[curr]:
            if neighbor not in visited:
                stack.append(neighbor)


def count_components(n, edges):
    graph = {i: [] for i in range(n)}
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)

    visited = set()
    count = 0
    for node in range(n):
        if node not in visited:
            dfs_visit(graph, node, visited)
            count += 1
    return count


print(count_components(5, [[0, 1], [1, 2], [3, 4]]))
`,
      javascript: `function dfsVisit(graph, node, visited) {
  const stack = [node];
  while (stack.length > 0) {
    const curr = stack.pop();
    if (visited.has(curr)) {
      continue;
    }
    visited.add(curr);
    for (const neighbor of graph[curr]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}

function countComponents(n, edges) {
  const graph = {};
  for (let i = 0; i < n; i++) {
    graph[i] = [];
  }
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Set();
  let count = 0;
  for (let node = 0; node < n; node++) {
    if (!visited.has(node)) {
      dfsVisit(graph, node, visited);
      count++;
    }
  }
  return count;
}

console.log(
  countComponents(5, [
    [0, 1],
    [1, 2],
    [3, 4],
  ]),
);
`,
      typescript: `function dfsVisit(graph: Record<number, number[]>, node: number, visited: Set<number>): void {
  const stack = [node];
  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (visited.has(curr)) {
      continue;
    }
    visited.add(curr);
    for (const neighbor of graph[curr]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}

function countComponents(n: number, edges: [number, number][]): number {
  const graph: Record<number, number[]> = {};
  for (let i = 0; i < n; i++) {
    graph[i] = [];
  }
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const visited = new Set<number>();
  let count = 0;
  for (let node = 0; node < n; node++) {
    if (!visited.has(node)) {
      dfsVisit(graph, node, visited);
      count++;
    }
  }
  return count;
}

console.log(
  countComponents(5, [
    [0, 1],
    [1, 2],
    [3, 4],
  ]),
);
`,
    },
  },
]
