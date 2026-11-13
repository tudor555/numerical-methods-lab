import { all, create, type MathNode } from "mathjs";

/**
 * Restricted expression layer on top of math.js.
 *
 * Only the declared variables, a few constants and a whitelist of real
 * functions are allowed. Assignment, function definition, units, matrices,
 * strings, comparisons and every other math.js feature are rejected.
 * `predictable: true` keeps results real (sqrt(-1) is NaN, not a complex number).
 */
const math = create(all, { predictable: true });

/** Constants a user may type. */
export const ALLOWED_CONSTANTS = ["pi", "e"] as const;

/** Real functions a user may call. `ln` and `lg` are aliases rewritten before evaluation. */
export const ALLOWED_FUNCTIONS = [
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "asin",
  "acos",
  "atan",
  "sinh",
  "cosh",
  "tanh",
  "sech",
  "csch",
  "coth",
  "exp",
  "log",
  "ln",
  "lg",
  "log10",
  "sqrt",
  "cbrt",
  "abs",
] as const;

const FUNCTION_ALIASES: Record<string, string> = { ln: "log", lg: "log10" };

const ALLOWED_OPERATORS = new Set([
  "add",
  "subtract",
  "multiply",
  "divide",
  "pow",
  "unaryMinus",
  "unaryPlus",
]);

const constantSet = new Set<string>(ALLOWED_CONSTANTS);
const functionSet = new Set<string>(ALLOWED_FUNCTIONS);

export type ExpressionErrorCode =
  /** The field is empty. */
  | "empty"
  /** math.js could not parse the text. */
  | "syntax"
  /** A symbol that is neither a declared variable nor an allowed constant. */
  | "unknown-symbol"
  /** A function outside the whitelist. */
  | "unknown-function"
  /** Assignment, function definition, or any other construct outside plain arithmetic. */
  | "forbidden"
  /** A constant expression whose value is NaN or ±∞. */
  | "not-finite"
  /** math.js cannot differentiate the expression. */
  | "not-differentiable";

/** Typed error for anything wrong with the text of an expression. */
export class ExpressionError extends Error {
  readonly code: ExpressionErrorCode;
  /** Offending symbol, function or operator, when there is one. */
  readonly detail?: string;

  constructor(code: ExpressionErrorCode, detail?: string, message?: string) {
    super(message ?? (detail ? `${code}: ${detail}` : code));
    this.name = "ExpressionError";
    this.code = code;
    this.detail = detail;
  }
}

export type EvaluationErrorCode = "undefined-value" | "overflow";

/** Thrown by a compiled function when the value is NaN (`undefined-value`) or ±∞ (`overflow`). */
export class EvaluationError extends Error {
  readonly code: EvaluationErrorCode;
  readonly args: readonly number[];

  constructor(code: EvaluationErrorCode, args: readonly number[]) {
    super(`${code} at (${args.join(", ")})`);
    this.name = "EvaluationError";
    this.code = code;
    this.args = args;
  }
}

/** How rejected constructs are named in messages. */
const NODE_LABELS: Record<string, string> = {
  AssignmentNode: "=",
  FunctionAssignmentNode: "f(x) = …",
  ArrayNode: "[ ]",
  IndexNode: "[ ]",
  ObjectNode: "{ }",
  ConditionalNode: "? :",
  RangeNode: ":",
  AccessorNode: ".",
  BlockNode: ";",
  RelationalNode: "<, >",
};

function validate(node: MathNode, variables: ReadonlySet<string>): void {
  node.traverse((child, path, parent) => {
    switch (child.type) {
      case "ConstantNode": {
        const value = (child as unknown as { value: unknown }).value;
        if (typeof value !== "number") throw new ExpressionError("forbidden", String(value));
        return;
      }
      case "SymbolNode": {
        const name = (child as unknown as { name: string }).name;
        // The callee of a FunctionNode is checked when the FunctionNode is visited.
        if (parent?.type === "FunctionNode" && path === "fn") return;
        if (variables.has(name) || constantSet.has(name)) return;
        if (functionSet.has(name)) throw new ExpressionError("forbidden", name);
        throw new ExpressionError("unknown-symbol", name);
      }
      case "FunctionNode": {
        const fn = (child as unknown as { fn: MathNode }).fn;
        const name = fn.type === "SymbolNode" ? (fn as unknown as { name: string }).name : "";
        if (!functionSet.has(name))
          throw new ExpressionError("unknown-function", name || fn.toString());
        // Every whitelisted function takes exactly one argument.
        const args = (child as unknown as { args: MathNode[] }).args;
        if (args.length !== 1) throw new ExpressionError("syntax", name);
        return;
      }
      case "OperatorNode": {
        const op = child as unknown as { fn: string; op: string };
        if (!ALLOWED_OPERATORS.has(op.fn)) throw new ExpressionError("forbidden", op.op);
        return;
      }
      case "ParenthesisNode":
        return;
      default:
        throw new ExpressionError("forbidden", NODE_LABELS[child.type] ?? child.type);
    }
  });
}

/** Rewrites `ln` → `log` and `lg` → `log10` so math.js can evaluate and differentiate them. */
function rewriteAliases(node: MathNode): MathNode {
  return node.transform((child) => {
    if (child.type === "FunctionNode") {
      const fn = child as unknown as { fn: MathNode; args: MathNode[] };
      const name = fn.fn.type === "SymbolNode" ? (fn.fn as unknown as { name: string }).name : "";
      const alias = FUNCTION_ALIASES[name];
      if (alias) return new math.FunctionNode(new math.SymbolNode(alias), fn.args);
    }
    return child;
  });
}

/**
 * Parses and checks an expression. Returns the (alias-rewritten) syntax tree.
 * @throws {ExpressionError}
 */
export function parseRestricted(source: string, variables: readonly string[]): MathNode {
  if (source.trim() === "") throw new ExpressionError("empty");
  let node: MathNode;
  try {
    node = math.parse(source);
  } catch (error) {
    throw new ExpressionError(
      "syntax",
      undefined,
      error instanceof Error ? error.message : String(error),
    );
  }
  validate(node, new Set(variables));
  return rewriteAliases(node);
}

export type CompiledFunction = (...args: number[]) => number;

/**
 * Compiles an expression over the declared variables into `(…args) => number`,
 * with the arguments in the order of `variables`.
 * The function throws {@link EvaluationError} when the value is NaN or ±∞.
 * @throws {ExpressionError}
 */
export function compile(source: string, variables: readonly string[]): CompiledFunction {
  const code = parseRestricted(source, variables).compile();
  return (...args: number[]) => {
    const scope: Record<string, number> = {};
    variables.forEach((name, i) => {
      scope[name] = args[i];
    });
    let raw: unknown;
    try {
      raw = code.evaluate(scope);
    } catch {
      // Any math.js failure at evaluation time means the value is not defined here.
      throw new EvaluationError("undefined-value", args);
    }
    const value = typeof raw === "number" ? raw : Number.NaN;
    if (Number.isNaN(value)) throw new EvaluationError("undefined-value", args);
    if (!Number.isFinite(value)) throw new EvaluationError("overflow", args);
    return value;
  };
}

/**
 * Evaluates a constant expression such as `3*pi/8` or `1e-4`.
 * @throws {ExpressionError}
 */
export function parseConstant(source: string): number {
  const fn = compile(source, []);
  try {
    return fn();
  } catch (error) {
    if (error instanceof EvaluationError) throw new ExpressionError("not-finite");
    throw error;
  }
}

/**
 * Symbolic derivative of `source` with respect to `variable`, as a string the
 * restricted parser accepts again.
 * @throws {ExpressionError} when the source is invalid or math.js cannot differentiate it.
 */
export function derive(
  source: string,
  variable: string,
  variables: readonly string[] = [variable],
): string {
  const node = parseRestricted(source, variables);
  try {
    return math.derivative(node, variable).toString();
  } catch (error) {
    throw new ExpressionError(
      "not-differentiable",
      undefined,
      error instanceof Error ? error.message : String(error),
    );
  }
}
