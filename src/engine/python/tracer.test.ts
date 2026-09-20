// @vitest-environment node
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPyodide, type PyodideInterface } from 'pyodide'
import { beforeAll, describe, expect, it } from 'vitest'

const tracerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'tracer.py'),
  'utf-8',
)

let pyodide: PyodideInterface

beforeAll(async () => {
  pyodide = await loadPyodide()
  pyodide.runPython(tracerSource)
}, 60000)

function trace(code: string) {
  pyodide.globals.set('__algolens_source__', code)
  const resultJson: string = pyodide.runPython(
    'import json\njson.dumps(trace_code(__algolens_source__, {"__name__": "__main__"}))',
  )
  return JSON.parse(resultJson)
}

describe('python tracer (real Pyodide execution)', () => {
  it('produces a real execution trace for a simple program', () => {
    const result = trace('x = 10\ny = 20\nz = x + y\nprint(z)\n')

    expect(result.error).toBeNull()
    expect(result.stdout).toBe('30\n')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps.at(-1).state.globals.z).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 30,
    })
  })

  it('captures a runtime error with its line number', () => {
    const result = trace('x = 1\ny = x / 0\n')

    expect(result.error.type).toBe('ZeroDivisionError')
    expect(result.error.lineNumber).toBe(2)
  })

  it('traces function calls with a call stack', () => {
    const result = trace('def add(a, b):\n    return a + b\n\nresult = add(2, 3)\n')

    const callStep = result.steps.find(
      (step: { eventType: string; state: { stack: { functionName: string }[] } }) =>
        step.eventType === 'call' &&
        step.state.stack.some((frame) => frame.functionName === 'add'),
    )
    expect(callStep).toBeDefined()

    const returnStep = result.steps.find(
      (step: { eventType: string; state: { stack: { functionName: string }[] } }) =>
        step.eventType === 'return' &&
        step.state.stack.some((frame) => frame.functionName === 'add'),
    )
    expect(returnStep.returnValue).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 5,
    })
  })

  it('reports a syntax error without crashing', () => {
    const result = trace('def broken(:\n    pass\n')

    expect(result.error.type).toBe('SyntaxError')
  })

  it('serializes a custom object instance with its real fields and a stable identity', () => {
    const result = trace(
      'class ListNode:\n' +
        '    def __init__(self, val=0, next=None):\n' +
        '        self.val = val\n' +
        '        self.next = next\n\n' +
        'head = ListNode(1, ListNode(2))\n',
    )

    expect(result.error).toBeNull()
    const finalGlobals = result.steps.at(-1).state.globals
    const head = finalGlobals.head

    expect(head.kind).toBe('object')
    expect(head.type).toBe('ListNode')
    expect(typeof head.objectId).toBe('number')
    expect(head.attributes.val).toEqual({ kind: 'primitive', type: 'int', value: 1 })
    expect(head.attributes.next.type).toBe('ListNode')
    expect(head.attributes.next.attributes.val).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 2,
    })
    expect(head.attributes.next.attributes.next).toEqual({
      kind: 'primitive',
      type: 'NoneType',
      value: null,
    })
  })

  it('truncates a self-referential object cycle instead of recursing forever', () => {
    const result = trace(
      'class Node:\n' +
        '    def __init__(self):\n' +
        '        self.next = None\n\n' +
        'a = Node()\n' +
        'b = Node()\n' +
        'a.next = b\n' +
        'b.next = a\n',
    )

    expect(result.error).toBeNull()
    const finalGlobals = result.steps.at(-1).state.globals
    const a = finalGlobals.a

    expect(a.attributes.next.type).toBe('Node')
    // a -> b -> a: the second occurrence of `a` is truncated to the
    // circular sentinel rather than serialized again.
    expect(a.attributes.next.attributes.next).toEqual({
      kind: 'object',
      type: 'Node',
      repr: '<circular>',
    })
  })

  it('serializes a two-pointer tree node with both children as real fields', () => {
    const result = trace(
      'class TreeNode:\n' +
        '    def __init__(self, val=0, left=None, right=None):\n' +
        '        self.val = val\n' +
        '        self.left = left\n' +
        '        self.right = right\n\n' +
        'root = TreeNode(2, TreeNode(1), TreeNode(3))\n',
    )

    expect(result.error).toBeNull()
    const root = result.steps.at(-1).state.globals.root

    expect(root.type).toBe('TreeNode')
    expect(Object.keys(root.attributes)).toEqual(['val', 'left', 'right'])
    expect(root.attributes.left.attributes.val).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 1,
    })
    expect(root.attributes.right.attributes.val).toEqual({
      kind: 'primitive',
      type: 'int',
      value: 3,
    })
    expect(root.attributes.left.attributes.left).toEqual({
      kind: 'primitive',
      type: 'NoneType',
      value: null,
    })
  })
})
