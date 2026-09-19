import io
import sys

MAX_STEPS = 20000
SOURCE_NAME = "<algolens>"


def _serialize(value, seen=None, depth=0):
    if seen is None:
        seen = set()
    if value is None or isinstance(value, (bool, int, float, str)):
        return {"kind": "primitive", "type": type(value).__name__, "value": value}
    if depth > 6:
        return {"kind": "object", "type": type(value).__name__, "repr": "..."}

    obj_id = id(value)
    if obj_id in seen:
        return {"kind": "object", "type": type(value).__name__, "repr": "<circular>"}
    seen = seen | {obj_id}

    if isinstance(value, (list, tuple, set, frozenset)):
        return {
            "kind": "list",
            "type": type(value).__name__,
            "items": [_serialize(v, seen, depth + 1) for v in value],
        }
    if isinstance(value, dict):
        return {
            "kind": "dict",
            "type": "dict",
            "entries": [
                [_serialize(k, seen, depth + 1), _serialize(v, seen, depth + 1)]
                for k, v in value.items()
            ],
        }
    try:
        representation = repr(value)
    except Exception:
        representation = "<unrepresentable>"

    # A user-defined class instance (ListNode, TreeNode, ...) — serialize its
    # real fields instead of just an opaque repr, so structures like linked
    # lists can be reconstructed generically on the frontend. objectId lets
    # the frontend recognize when two variables point at the same instance,
    # or when a chain of .next pointers has looped back on itself.
    if hasattr(value, "__dict__") and not isinstance(value, type):
        attributes = {
            key: _serialize(val, seen, depth + 1)
            for key, val in vars(value).items()
            if not key.startswith("__")
        }
        return {
            "kind": "object",
            "type": type(value).__name__,
            "repr": representation,
            "objectId": obj_id,
            "attributes": attributes,
        }

    return {"kind": "object", "type": type(value).__name__, "repr": representation}


def _serialize_scope(mapping):
    return {
        key: _serialize(value)
        for key, value in mapping.items()
        if not key.startswith("__")
    }


class StepLimitExceeded(Exception):
    pass


def trace_code(source, run_globals):
    steps = []
    error = None
    step_count = 0

    def tracer(frame, event, arg):
        nonlocal step_count
        if frame.f_code.co_filename != SOURCE_NAME:
            return None

        step_count += 1
        if step_count > MAX_STEPS:
            raise StepLimitExceeded()

        stack = []
        current = frame
        while current is not None:
            if current.f_code.co_filename == SOURCE_NAME:
                stack.append(
                    {
                        "functionName": current.f_code.co_name,
                        "lineNumber": current.f_lineno,
                        "locals": _serialize_scope(current.f_locals),
                    }
                )
            current = current.f_back
        stack.reverse()

        step = {
            "stepNumber": step_count,
            "lineNumber": frame.f_lineno,
            "eventType": event,
            "state": {
                "lineNumber": frame.f_lineno,
                "stack": stack,
                "globals": _serialize_scope(run_globals),
            },
        }
        if event == "return":
            step["returnValue"] = _serialize(arg)
        steps.append(step)

        return tracer

    stdout_capture = io.StringIO()
    real_stdout = sys.stdout
    sys.stdout = stdout_capture
    try:
        compiled = compile(source, SOURCE_NAME, "exec")
        sys.settrace(tracer)
        try:
            exec(compiled, run_globals)
        finally:
            sys.settrace(None)
    except StepLimitExceeded:
        error = {
            "type": "StepLimitExceeded",
            "message": f"Execution stopped after {MAX_STEPS} steps.",
        }
    except SyntaxError as exc:
        error = {"type": "SyntaxError", "message": str(exc), "lineNumber": exc.lineno}
    except BaseException as exc:
        lineno = None
        tb = exc.__traceback__
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == SOURCE_NAME:
                lineno = tb.tb_lineno
            tb = tb.tb_next
        error = {"type": type(exc).__name__, "message": str(exc), "lineNumber": lineno}
    finally:
        sys.stdout = real_stdout

    return {"steps": steps, "stdout": stdout_capture.getvalue(), "error": error}
