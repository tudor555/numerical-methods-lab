/**
 * English dictionary. The source of truth for message keys: `ro.ts` must have exactly these keys.
 * Text may contain inline TeX between `$…$` and `{param}` placeholders.
 */
export const en = {
  "app.name": "Numerical Methods Lab",
  "app.tagline": "Watch numerical methods converge, one iterate at a time.",
  "lang.label": "Language",
  "lang.en": "English",
  "lang.ro": "Romanian",

  "notFound.title": "Page not found",
  "notFound.body": "This page does not exist, or its lab is not available yet.",
  "notFound.back": "Back to all labs",

  "hub.title": "Labs",
  "hub.intro":
    "Pick a method, type your own function or load a worked example, and see every step unfold: each iterate, how fast the error shrinks, and how the methods stack up against each other.",
  "hub.lab": "Lab {n}",
  "hub.open": "Open lab",
  "hub.comingSoon": "Coming soon",

  "lab1.title": "Newton's method and k-th roots",
  "lab1.topic": "Tangent method, k-th root of c, successive approximations",
  "lab2.title": "Secant and Steffensen methods",
  "lab2.topic": "Derivative-free methods for f(x) = 0",
  "lab3.title": "Halley and Chebyshev methods",
  "lab3.topic": "Third-order methods using f″",
  "lab4.title": "Third-order iterative methods",
  "lab4.topic": "Combined tangent method, third-order square root",
  "lab5.title": "Newton's method for 2×2 systems",
  "lab5.topic": "Newton and modified Newton for nonlinear systems",
  "lab6.title": "Successive approximations and Gauss–Seidel",
  "lab6.topic": "Fixed-point iteration for 2-D and 3-D nonlinear systems",
  "lab7.title": "Euler-type methods",
  "lab7.topic": "Euler, modified Euler and Euler–Heun for y′ = f(x, y)",
  "lab8.title": "Runge–Kutta methods of order 2 and 3",
  "lab8.topic": "Heun, RK2, Runge–Simpson and Runge (1895)",
  "lab9.title": "Runge–Kutta methods of order 4",
  "lab9.topic": "Classic RK4 and the 3/8 rule",
  "lab10.title": "Picard iteration with the trapezoidal rule",
  "lab10.topic": "Successive approximations for first-order Cauchy problems",
  "lab11.title": "Successive approximations for boundary-value problems",
  "lab11.topic": "Second-order problems x″ = f(t, x)",
  "lab12.title": "Green's function method",
  "lab12.topic": "Second-order Cauchy and fourth-order boundary-value problems",
  "lab13.title": "Finite differences",
  "lab13.topic": "Linear second-order boundary-value problems, Thomas algorithm",

  "lab.back": "All labs",
  "lab.number": "Lab {n}",
  "lab.section.explanation": "How it works",
  "lab.section.parameters": "Parameters",
  "lab.section.results": "Results",
  "lab.section.comparison": "Comparisons",
  "lab.presets": "Worked examples",
  "lab.methods": "Methods",

  "common.stopping":
    "Stopping rule: $x_1$ is computed from $x_0$ as a separate step, then the iteration continues from $n = 1$ while $|x_n - x_{n-1}| \\ge \\varepsilon$. The output is $n$ and $x_n$.",

  "math.if": "if",

  "form.run": "Run",
  "form.blocked": "Fix the highlighted fields to run.",
  "form.derive": "Derive from f",
  "form.exprHint":
    "Variables: {vars}. Functions such as sin, cos, exp, ln, lg, sqrt. Constants: pi, e.",
  "form.numberHint": "A number or a constant expression, e.g. 3*pi/8 or 1e-4.",

  "field.f": "Function",
  "field.df": "Derivative",
  "field.a": "Left end of the interval",
  "field.b": "Right end of the interval",
  "field.x0Mode": "Starting value",
  "field.x0Mode.r0": "Rule R0",
  "field.x0Mode.manual": "Enter x₀",
  "field.dda": "Second derivative at a",
  "field.x0": "Starting value",
  "field.eps": "Tolerance",
  "field.maxIter": "Maximum number of iterations",
  "field.c": "Radicand",
  "field.k": "Root order",
  "field.phi": "Iteration function",

  "field.error.empty": "Required.",
  "field.error.syntax": "Cannot read this expression. Check the operators and parentheses.",
  "field.error.unknown-symbol": "Unknown symbol “{name}”. Allowed: {allowed}.",
  "field.error.unknown-function": "Unknown function “{name}”.",
  "field.error.forbidden":
    "“{name}” is not allowed. Use arithmetic, the listed functions and the declared variables.",
  "field.error.not-finite": "The value must be a finite number.",
  "field.error.not-differentiable": "This expression cannot be differentiated automatically.",
  "field.error.positive": "Must be greater than 0.",
  "field.error.min": "Must be at least {min}.",
  "field.error.integer-min": "Must be a whole number, at least {min}.",
  "field.error.integer-range": "Must be a whole number between {min} and {max}.",
  "field.error.greater-than": "Must be greater than {other}.",
  "field.error.derive-failed":
    "Fix the function (and the point) first, or enter the value by hand.",
  "field.error.derive-undefined":
    "The derivative is undefined at this point. Enter the value by hand.",

  "result.empty": "Load a worked example or edit the parameters, then press Run.",
  "result.status.converged": "Converged",
  "result.status.max-iterations": "Max iterations reached",
  "result.status.error": "Error",
  "result.value": "Result",
  "result.iterations": "Iterations",
  "result.start": "Starting value",
  "result.startRule": "chosen by R0 (x₀ = {end})",
  "result.exact": "Exact value",
  "result.error": "Error",
  "result.converged": "|xₙ − xₙ₋₁| < ε after n = {n} iterations.",
  "result.maxIterations":
    "Stopped at the cap of {n} iterations while |xₙ − xₙ₋₁| was still ≥ ε. The last iterate is shown, but it does not meet the tolerance.",
  "result.partial": "The iterations computed before the error are kept below.",

  "run.error.zero-derivative":
    "The derivative is zero at n = {n}, xₙ = {x}. The step divides by zero, so xₙ₊₁ is undefined.",
  "run.error.undefined-value":
    "A value is undefined (NaN) in the step from n = {n}, xₙ = {x}. Check the domain of the functions (√ of a negative number, ln of a non-positive one).",
  "run.error.overflow": "A value overflowed to ±∞ in the step from n = {n}, xₙ = {x}.",
  "run.error.diverged": "The iteration diverges: |xₙ| passed 10¹⁰⁰ at n = {n} (xₙ = {x}).",

  "table.title": "Iterations",
  "table.hidden": "Hidden iterations: {count}",
  "table.showAll": "Show all",

  "chart.tangent": "f(x) with the tangent steps",
  "chart.cobweb": "φ(x), y = x and the iteration path",
  "chart.convergence": "Convergence: |xₙ − xₙ₋₁| on a log scale",
  "chart.toolbar": "Chart tools",
  "chart.tool.zoom": "Zoom to an area",
  "chart.tool.pan": "Pan",
  "chart.tool.zoomIn": "Zoom in",
  "chart.tool.zoomOut": "Zoom out",
  "chart.tool.reset": "Reset view",
  "chart.tool.download": "Download as PNG",
  "chart.trace.f": "f(x)",
  "chart.trace.iterates": "Iterates",
  "chart.trace.tangents": "Tangent steps",
  "chart.trace.phi": "φ(x)",
  "chart.trace.identity": "y = x",
  "chart.trace.path": "Iteration path",
  "chart.trace.diff": "|xₙ − xₙ₋₁|",
  "chart.trace.eps": "ε",
  "chart.trace.error": "|xₙ − exact value|",

  "compare.run": "Run comparison",
  "compare.method": "Method",
  "compare.hint": "Each cell shows the number of iterations n and the final xₙ.",
  "compare.cell.error": "Error",
  "compare.cell.max": "Cap reached",

  "lab1.intro":
    "Solve f(x) = 0 with Newton's tangent method, compute k-th roots with the same idea, and see how both compare with successive approximations.",
  "lab1.method.newton.tab": "1a · Newton",
  "lab1.method.newton.title": "Newton's (tangent) method",
  "lab1.method.newton.name": "Tangent method",
  "lab1.method.newton.idea":
    "Near $x_n$, $f$ is replaced by its tangent line. The point where the tangent crosses the x-axis is the next iterate:",
  "lab1.method.newton.start":
    "The starting value comes from rule R0, which checks the sign of $f(a)\\,f''(a)$. You enter $f''(a)$, the second derivative at the left end $a$, in the field dda. To start from another point, choose “Enter x₀” and type $x_0$ directly.",
  "lab1.method.newton.failure":
    "If $f'(x_n) = 0$ the tangent is horizontal and the method stops with an error.",

  "lab1.method.kthRoot.tab": "1b · k-th root",
  "lab1.method.kthRoot.title": "k-th root of c",
  "lab1.method.kthRoot.name": "Tangent method",
  "lab1.method.kthRoot.idea":
    "Newton's method applied to $f(x) = x^k - c$, with $f'(x) = k\\,x^{k-1}$, gives an iteration that needs only arithmetic:",
  "lab1.method.kthRoot.start": "Starting value: $x_0 = c$ if $c > 1$, otherwise $x_0 = 1$.",

  "lab1.method.fixedPoint.tab": "1c · Successive approximations",
  "lab1.method.fixedPoint.title": "Successive approximations",
  "lab1.method.fixedPoint.name": "Successive approx.",
  "lab1.method.fixedPoint.idea":
    "Write the equation as $x = \\varphi(x)$ and iterate from a starting value $x_0$:",
  "lab1.method.fixedPoint.convergence":
    "The iteration converges near a fixed point where $|\\varphi'(x)| < 1$, and the smaller $|\\varphi'|$, the faster. Convergence is linear, while Newton's is quadratic, as the comparisons show.",

  "lab1.preset.ex1": "Ex. 1: x³ − x − 1 = 0 on [1, 2]",
  "lab1.preset.ex2R0": "Ex. 2: x⁵ − 5x + 1 = 0, R0 on [−1, 1]",
  "lab1.preset.ex2Manual": "Ex. 2: x⁵ − 5x + 1 = 0, x₀ = 0",
  "lab1.preset.kepler": "Ex. 3: Kepler, x = sin x + 0.25",
  "lab1.preset.sqrt2": "√2",
  "lab1.preset.sqrt3": "√3",
  "lab1.preset.sqrt5": "√5",
  "lab1.preset.cbrt2": "∛2",
  "lab1.preset.cbrt3": "∛3",
  "lab1.preset.cbrt12": "∛12",
  "lab1.preset.keplerFp": "Ex. 3: Kepler, φ = sin x + 0.25",
  "lab1.preset.sqrt2Fp": "√2: φ = (x + 2)/(x + 1)",
  "lab1.preset.sqrt3Fp": "√3: φ = (x + 3)/(x + 1)",
  "lab1.preset.sqrt5Fp": "√5: φ = (x + 5)/(x + 1)",

  "compare.task": "Lab task",
  "lab1.compare.ex1.task":
    "Approximate the real root with ε = 10⁻⁴, 10⁻⁸ and 10⁻¹², and see how many iterations each precision needs.",
  "lab1.compare.ex2.task":
    "Approximate the root in (−1, 1) with ε = 10⁻⁴, 10⁻⁸ and 10⁻¹², and compare the iteration counts. Rule R0 fails on this interval (f′(1) = 0), so a start at x₀ = 0 is shown as well.",
  "lab1.compare.kepler.task":
    "Start from x₀ = 3π/8 with ε = 10⁻⁴ and compare the tangent method with successive approximations, φ(x) = sin x + 0.25.",
  "lab1.compare.sqrt.task":
    "Approximate √2, √3 and √5 with the tangent method and compare the results with successive approximations. The lab gives no ε here, so the three precisions of ex. 1–2 are used.",
  "lab1.compare.ex1": "Ex. 1: x³ − x − 1 = 0",
  "lab1.compare.ex2": "Ex. 2: x⁵ − 5x + 1 = 0 on (−1, 1)",
  "lab1.compare.kepler": "Ex. 3: Kepler's equation, x = sin x + 0.25",
  "lab1.compare.sqrt": "Ex. 4: √2, √3, √5",
} as const;

export type MessageKey = keyof typeof en;
