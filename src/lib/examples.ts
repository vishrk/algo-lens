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
]
