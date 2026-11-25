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
  "lab3.title": "Halley's method and Chebyshev-type methods",
  "lab3.topic": "Generalizations of the tangent method",
  "lab4.title": "Third-order iterative methods",
  "lab4.topic": "Combined tangent method and third-order square roots",
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
    "Stopping rule: the first step, from $x_0$ to $x_1$, is always taken. Then, from $n = 1$, the iteration continues while $|x_n - x_{n-1}| \\ge \\varepsilon$, that is, until two consecutive iterates differ by less than $\\varepsilon$. The output is $n$ and $x_n$.",
  "common.systemStopping":
    "Stopping rule: the first step, from $(x_0, y_0)$ to $(x_1, y_1)$, is always taken. Then, from $n = 1$, the iteration continues while $|x_n - x_{n-1}| \\ge \\varepsilon$ or $|y_n - y_{n-1}| \\ge \\varepsilon$, that is, until both coordinates change by less than $\\varepsilon$. The output is $n$ and $(x_n, y_n)$.",
  "common.system3Stopping":
    "Stopping rule: the first step, from $(x_0, y_0, z_0)$ to $(x_1, y_1, z_1)$, is always taken. Then, from $n = 1$, the iteration continues while $|x_n - x_{n-1}| \\ge \\varepsilon$, $|y_n - y_{n-1}| \\ge \\varepsilon$ or $|z_n - z_{n-1}| \\ge \\varepsilon$, that is, until all three coordinates change by less than $\\varepsilon$. The output is $n$ and $(x_n, y_n, z_n)$.",

  "math.if": "if",

  "form.run": "Run",
  "form.blocked": "Fix the highlighted fields to run.",
  "form.derive": "Derive from {source}",
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
  "field.ddf": "Second derivative",
  "field.x0": "Starting value",
  "field.x1": "Second starting value",
  "field.eps": "Tolerance",
  "field.maxIter": "Maximum number of iterations",
  "field.c": "Radicand",
  "field.k": "Root order",
  "field.phi": "Iteration function",
  "field.F": "Function F",
  "field.G": "Function G",
  "field.partial": "Partial derivative",
  "field.startX": "Starting point, x",
  "field.startY": "Starting point, y",
  "field.F1": "Function F₁",
  "field.F2": "Function F₂",
  "field.F3": "Function F₃",
  "field.startZ": "Starting point, z",

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
  "field.error.range": "Must be between {min} and {max}.",
  "field.error.positive-max": "Must be greater than 0 and at most {max}.",
  "field.error.integer-min": "Must be a whole number, at least {min}.",
  "field.error.integer-range": "Must be a whole number between {min} and {max}.",
  "field.error.greater-than": "Must be greater than {other}.",
  "field.error.different-from": "Must differ from {other}.",
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
  "result.system.converged": "|xₙ − xₙ₋₁| < ε and |yₙ − yₙ₋₁| < ε after n = {n} iterations.",
  "result.system.maxIterations":
    "Stopped at the cap of {n} iterations while |xₙ − xₙ₋₁| or |yₙ − yₙ₋₁| was still ≥ ε. The last iterate is shown, but it does not meet the tolerance.",
  "result.system3.converged":
    "|xₙ − xₙ₋₁| < ε, |yₙ − yₙ₋₁| < ε and |zₙ − zₙ₋₁| < ε after n = {n} iterations.",
  "result.system3.maxIterations":
    "Stopped at the cap of {n} iterations while |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| or |zₙ − zₙ₋₁| was still ≥ ε. The last iterate is shown, but it does not meet the tolerance.",
  "result.startPoint": "Starting point",
  "result.exactSolution": "Exact solution",

  "run.error.zero-derivative":
    "The derivative is zero at n = {n}, xₙ = {x}. The step divides by zero, so xₙ₊₁ is undefined.",
  "run.error.zero-denominator":
    "The denominator is zero at n = {n}, xₙ = {x}: f takes the same value at both points, so xₙ₊₁ is undefined.",
  "run.error.undefined-value":
    "A value is undefined (NaN) in the step from n = {n}, xₙ = {x}. Check the domain of the functions (√ of a negative number, ln of a non-positive one).",
  "run.error.overflow": "A value overflowed to ±∞ in the step from n = {n}, xₙ = {x}.",
  "run.error.diverged": "The iteration diverges: |xₙ| passed 10¹⁰⁰ at n = {n} (xₙ = {x}).",
  "run.systemError.zero-jacobian":
    "The Jacobian J is zero at n = {n}, (xₙ, yₙ) = {point}. The step divides by zero, so (xₙ₊₁, yₙ₊₁) is undefined.",
  "run.systemError.undefined-value":
    "A value is undefined (NaN) in the step from n = {n}, (xₙ, yₙ) = {point}. Check the domain of the functions (√ of a negative number, ln of a non-positive one).",
  "run.systemError.overflow":
    "A value overflowed to ±∞ in the step from n = {n}, (xₙ, yₙ) = {point}.",
  "run.systemError.diverged":
    "The iteration diverges: at n = {n}, (xₙ, yₙ) = {point}, |xₙ| or |yₙ| passed 10¹⁰⁰.",
  "run.system3Error.undefined-value":
    "A value is undefined (NaN) in the step from n = {n}, (xₙ, yₙ, zₙ) = {point}. Check the domain of the functions (√ of a negative number, ln of a non-positive one).",
  "run.system3Error.overflow":
    "A value overflowed to ±∞ in the step from n = {n}, (xₙ, yₙ, zₙ) = {point}.",
  "run.system3Error.diverged":
    "The iteration diverges: at n = {n}, (xₙ, yₙ, zₙ) = {point}, |xₙ|, |yₙ| or |zₙ| passed 10¹⁰⁰.",

  "table.title": "Iterations",
  "table.hidden": "Hidden iterations: {count}",
  "table.showAll": "Show all",

  "chart.tangent": "f(x) with the tangent steps",
  "chart.secant": "f(x) with the secant lines",
  "chart.steffensen": "f(x) with the Steffensen steps",
  "chart.halley": "f(x) with Halley's tangent hyperbolas",
  "chart.chebyshev": "f(x) with Chebyshev's tangent parabolas",
  "chart.combinedTangent": "f(x) with the combined tangent steps",
  "chart.cobweb": "φ(x), y = x and the iteration path",
  "chart.convergence": "Convergence: |xₙ − xₙ₋₁| on a log scale",
  "chart.path": "F = 0 and G = 0 with the iteration path",
  "chart.systemConvergence": "Convergence: |xₙ − xₙ₋₁| and |yₙ − yₙ₋₁| on a log scale",
  "chart.fixedPointPath": "x = F(x, y) and y = G(x, y) with the iteration path",
  "chart.components": "xₙ, yₙ and zₙ at each iteration",
  "chart.system3Convergence":
    "Convergence: |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| and |zₙ − zₙ₋₁| on a log scale",
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
  "chart.trace.secants": "Secant lines",
  "chart.trace.steffensenSteps": "Steffensen steps",
  "chart.trace.halleySteps": "Tangent hyperbolas",
  "chart.trace.chebyshevSteps": "Tangent parabolas",
  "chart.trace.combinedSteps": "Combined tangent steps",
  "chart.trace.phi": "φ(x)",
  "chart.trace.identity": "y = x",
  "chart.trace.path": "Iteration path",
  "chart.trace.diff": "|xₙ − xₙ₋₁|",
  "chart.trace.eps": "ε",
  "chart.trace.error": "|xₙ − exact value|",
  "chart.trace.curveF": "F(x, y) = 0",
  "chart.trace.curveG": "G(x, y) = 0",
  "chart.trace.diffY": "|yₙ − yₙ₋₁|",
  "chart.trace.systemError": "max(|xₙ − x*|, |yₙ − y*|)",
  "chart.trace.curveFixedX": "x = F(x, y)",
  "chart.trace.curveFixedY": "y = G(x, y)",
  "chart.trace.diffZ": "|zₙ − zₙ₋₁|",
  "chart.trace.componentX": "xₙ",
  "chart.trace.componentY": "yₙ",
  "chart.trace.componentZ": "zₙ",

  "compare.run": "Run comparison",
  "compare.method": "Method",
  "compare.hint": "Each cell shows the number of iterations n and the final xₙ.",
  "compare.systemHint": "Each cell shows the number of iterations n and the final point (xₙ, yₙ).",
  "compare.cell.error": "Error",
  "compare.cell.max": "Cap reached",
  "compare.inputs": "Inputs",
  "compare.precisions": "Precision",

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
  "lab1.preset.cbrtHalf": "∛(1/2)",
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
    "Approximate √2, √3 and √5 with the tangent method and compare the results with successive approximations. It uses the same three precisions as ex. 1–2.",
  "lab1.compare.ex1": "Ex. 1: x³ − x − 1 = 0",
  "lab1.compare.ex2": "Ex. 2: x⁵ − 5x + 1 = 0 on (−1, 1)",
  "lab1.compare.kepler": "Ex. 3: Kepler's equation, x = sin x + 0.25",
  "lab1.compare.sqrt": "Computing roots: √2, √3, √5",

  "lab2.intro":
    "Solve f(x) = 0 without a derivative: the secant method replaces the tangent with the secant line through the last two iterates, and Steffensen's method approximates the derivative from values of f alone. Then compare the results and iteration counts with the tangent method.",
  "lab2.method.secant.tab": "2a · Secant",
  "lab2.method.secant.title": "Secant method",
  "lab2.method.secant.name": "Secant method",
  "lab2.method.secant.idea":
    "The secant method needs no derivative: each step computes just one new value of $f$, and convergence is superlinear, of order $(1 + \\sqrt{5})/2 \\approx 1.618$, so faster than successive approximations but slower than the tangent method. Near the root, the graph of $f$ is approximated by the secant line through $(x_{n-1}, f(x_{n-1}))$ and $(x_n, f(x_n))$. The next iterate, $x_{n+1}$, is where this line crosses the x-axis:",
  "lab2.method.secant.start":
    "The method starts from two values: you enter both $x_0$ and $x_1$, and they must differ. The interval $[a, b]$ only sets the range of the chart.",
  "lab2.method.secant.stopping":
    "Stopping rule: $x_0$ and $x_1$ are both given. Then, from $n = 1$, the iteration continues while $|x_n - x_{n-1}| \\ge \\varepsilon$, that is, until two consecutive iterates differ by less than $\\varepsilon$. The output is $n$ and $x_n$.",
  "lab2.method.secant.failure":
    "If $f(x_n) = 0$, $x_n$ is the exact root and the iteration stays there. Otherwise, if $f(x_n) = f(x_{n-1})$, the chord is parallel to the x-axis and the method stops with an error.",

  "lab2.method.steffensen.tab": "2b · Steffensen",
  "lab2.method.steffensen.title": "Steffensen's method",
  "lab2.method.steffensen.name": "Steffensen's method",
  "lab2.method.steffensen.idea":
    "The tangent method without a derivative: $f'(x_n)$ is replaced by the slope of the chord through $(x_n, f(x_n))$ and $(x_n + f(x_n), f(x_n + f(x_n)))$. Each step costs two values of $f$, and close to the root it converges quadratically, like the tangent method:",
  "lab2.method.steffensen.start":
    "The starting value $x_0$ must satisfy $f(x_0)\\,f''(x_0) > 0$. The algorithm picks it with rule R0, from the sign of $f(a)\\,f''(a)$: enter $f''(a)$, the second derivative at the left end $a$, in the field dda, or derive it from f.",
  "lab2.method.steffensen.failure":
    "If $f(x_n) = 0$, $x_n$ is the exact root and the iteration stays there. Otherwise, if $f(x_n + f(x_n)) = f(x_n)$, the denominator is zero and the method stops with an error. $f$ must also be defined at the helper point $x_n + f(x_n)$: a domain error or an overflow can come from there, not only from $x_n$.",
  "lab2.method.steffensen.chart":
    "Far from the root, the helper point $x_n + f(x_n)$ can land well outside $[a, b]$ (from $x_0 = 2$ in the numerical example it is 7). The slope estimate is then poor and the first steps are slow, which is why the numerical example needs more iterations than the tangent method. The chart draws each step straight from $(x_n, f(x_n))$ to $(x_{n+1}, 0)$.",

  "lab2.preset.ex1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2, x₁ = 1.4",
  "lab2.preset.ex2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2, x₁ = 1.5",
  "lab2.preset.steffensen": "Numerical example: x³ − x − 1 = 0, x₀ = 2",

  "lab2.compare.ex1": "Ex. 1: √2 with the secant method",
  "lab2.compare.ex2": "Ex. 2: x³ − x − 1 = 0 with the secant method",
  "lab2.compare.steffensen": "Numerical example: x³ − x − 1 = 0 with Steffensen's method",
  "lab2.compare.ex1.task":
    "Approximate the number √2 with the secant method and compare the results with the tangent method. The tangent method derives f′ from f and takes x₀ from rule R0.",
  "lab2.compare.ex2.task":
    "Approximate the real root of x³ − x − 1 = 0 with the secant method and compare the results with the tangent method. The tangent method derives f′ from f and takes x₀ from rule R0.",
  "lab2.compare.steffensen.task":
    "Approximate the real root of x³ − x − 1 = 0 with Steffensen's method and compare the results with the tangent method. The tangent method derives f′ from f and takes x₀ from rule R0.",

  "lab3.intro":
    "Solve f(x) = 0 with Halley's method and Chebyshev's method, two generalizations of the tangent method that also use the second derivative. Then compare the results and iteration counts with the tangent method.",
  "lab3.method.halley.tab": "3a · Halley",
  "lab3.method.halley.title": "Halley's method",
  "lab3.method.halley.name": "Halley's method",
  "lab3.method.halley.idea":
    "As in the tangent method, near $x_n$ the graph of $f$ is replaced by a simple curve, and $x_{n+1}$ is where that curve crosses the x-axis. Halley's method uses the tangent hyperbola, which matches the value and slope of $f$ at $x_n$, and its curvature too. That is why, close to a simple root, the convergence is cubic rather than quadratic:",
  "lab3.method.halley.start":
    "The starting value $x_0$ must satisfy $f(x_0)\\,f''(x_0) > 0$. With “Rule R0”, the algorithm picks it from the ends $a$ and $b$; with “Enter x₀”, you type it directly.",
  "lab3.method.halley.failure":
    "If $f(x_n) = 0$, $x_n$ is the exact root and the iteration stays there. Otherwise, if $2f'(x_n)^2 - f(x_n)\\,f''(x_n) = 0$, the denominator is zero and the method stops with an error. If $f'(x_n) = 0$ while $f(x_n) \\ne 0$, the step would leave $x_n$ unchanged without reaching a root, so the method stops with an error as well.",
  "lab3.method.halley.chart":
    "The chart follows each step along its tangent hyperbola, from $(x_n, f(x_n))$ to $(x_{n+1}, 0)$. When $2f'(x_n)^2 - f(x_n)\\,f''(x_n) < 0$, the hyperbola's vertical asymptote lies between these two points, so that step is drawn as a straight segment.",
  "lab3.method.halley.error.zero-denominator":
    "The denominator 2f′(xₙ)² − f(xₙ)f″(xₙ) is zero at n = {n}, xₙ = {x}, so xₙ₊₁ is undefined.",

  "lab3.method.chebyshev.tab": "3b · Chebyshev",
  "lab3.method.chebyshev.title": "Chebyshev's method",
  "lab3.method.chebyshev.name": "Chebyshev's method",
  "lab3.method.chebyshev.idea":
    "As in the tangent method, near $x_n$ the graph of $f$ is replaced by a simple curve, and $x_{n+1}$ is where that curve crosses the x-axis. Chebyshev's method uses the tangent parabola, with its axis parallel to the x-axis and the same value, slope and curvature as $f$ at $x_n$. The convergence is cubic as well, like Halley's:",
  "lab3.method.chebyshev.start":
    "The starting value $x_0$ must satisfy $f(x_0)\\,f''(x_0) > 0$, and you enter it directly: this algorithm has no rule R0. The interval $[a, b]$ only sets the range of the chart.",
  "lab3.method.chebyshev.failure":
    "If $f(x_n) = 0$, $x_n$ is the exact root and the iteration stays there. Otherwise, if $f'(x_n) = 0$, both fractions divide by zero and the method stops with an error.",
  "lab3.method.chebyshev.chart":
    "The chart follows each step along its tangent parabola, from $(x_n, f(x_n))$ to $(x_{n+1}, 0)$.",

  "lab3.preset.ex1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
  "lab3.preset.ex2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2",
  "lab3.preset.chebyshev": "Numerical example: x³ − x − 1 = 0, x₀ = 2",

  "lab3.compare.ex1": "Ex. 1: √2 with Halley's method",
  "lab3.compare.ex2": "Ex. 2: x³ − x − 1 = 0 with Halley's method",
  "lab3.compare.chebyshev": "Numerical example: x³ − x − 1 = 0 with Chebyshev's method",
  "lab3.compare.ex1.task":
    "Approximate the number √2 with Halley's method and compare the results with the tangent method.",
  "lab3.compare.ex2.task":
    "Approximate the real root of x³ − x − 1 = 0 with Halley's method and compare the results with the tangent method.",
  "lab3.compare.chebyshev.task":
    "Approximate the real root of x³ − x − 1 = 0 with Chebyshev's method and compare the results with the tangent method.",

  "lab4.intro":
    "Solve f(x) = 0 with the combined tangent method, which follows each tangent step with a second step of the same slope, and compute square roots with a third-order iteration. Then compare the results and iteration counts with the tangent method.",
  "lab4.method.combinedTangent.tab": "4a · Combined tangent",
  "lab4.method.combinedTangent.title": "Combined tangent method",
  "lab4.method.combinedTangent.name": "Combined tangent method",
  "lab4.method.combinedTangent.idea":
    "Each step has two stages with the same slope $f'(x_n)$. The first is a tangent-method step, to $y_n = x_n - f(x_n)/f'(x_n)$. The second starts from $(y_n, f(y_n))$ on a line parallel to that tangent and crosses the x-axis at $x_{n+1}$. The derivative is evaluated once per step, and close to a simple root the convergence is cubic:",
  "lab4.method.combinedTangent.start":
    "The starting value $x_0$ must satisfy $f(x_0)\\,f''(x_0) > 0$, and you enter it directly: this algorithm has no rule R0. The interval $[a, b]$ only sets the range of the chart.",
  "lab4.method.combinedTangent.failure":
    "If $f(x_n) = 0$, $x_n$ is the exact root and the iteration stays there. Otherwise, if $f'(x_n) = 0$, the tangent is horizontal and the method stops with an error. $f$ must also be defined at the helper point $y_n$: a domain error or an overflow can come from there, not only from $x_n$.",
  "lab4.method.combinedTangent.chart":
    "The chart draws both stages of each step: the tangent from $(x_n, f(x_n))$ to $(y_n, 0)$, a dotted line to $(y_n, f(y_n))$, and the parallel line from there to $(x_{n+1}, 0)$.",

  "lab4.method.thirdOrderRoot.tab": "4b · Square roots",
  "lab4.method.thirdOrderRoot.title": "Square roots with the third-order method",
  "lab4.method.thirdOrderRoot.name": "Third-order method",
  "lab4.method.thirdOrderRoot.idea":
    "To approximate $\\sqrt{a}$, with $a > 0$, the method builds the sequence below, using only arithmetic. It is Halley's method applied to $f(x) = x^2 - a$, which is why it converges cubically close to $\\sqrt{a}$:",
  "lab4.method.thirdOrderRoot.start": "Starting value: $x_0 = a$.",
  "lab4.method.thirdOrderRoot.chart":
    "The chart shows $f(x) = x^2 - a$ and follows each step along Halley's tangent hyperbola, from $(x_n, x_n^2 - a)$ to $(x_{n+1}, 0)$.",

  "lab4.preset.combinedEx1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
  "lab4.preset.combinedEx2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2",
  "lab4.preset.rootEx1": "Ex. 1: √2, a = 2",
  "lab4.preset.rootEx2Sqrt3": "Ex. 2: √3, a = 3",
  "lab4.preset.rootEx2Sqrt5": "Ex. 2: √5, a = 5",

  "lab4.compare.combinedEx1": "Ex. 1: √2 with the combined tangent method",
  "lab4.compare.combinedEx2": "Ex. 2: x³ − x − 1 = 0 with the combined tangent method",
  "lab4.compare.rootEx1": "Ex. 1: √2 with the third-order method",
  "lab4.compare.rootEx2": "Ex. 2: √3 and √5 with the third-order method",
  "lab4.compare.combinedEx1.task":
    "Approximate the number √2 with the combined tangent method and compare the results with the tangent method.",
  "lab4.compare.combinedEx2.task":
    "Approximate the real root of x³ − x − 1 = 0 with the combined tangent method and compare the results with the tangent method.",
  "lab4.compare.rootEx1.task":
    "Approximate √2 with the third-order method and compare the results with the iterative method adapted from the tangent method.",
  "lab4.compare.rootEx2.task":
    "Approximate √3 and √5 with the third-order method and compare the results with the iterative method adapted from the tangent method. The method converges to √a, so a = 3 and a = 5 respectively.",

  "lab5.intro":
    "Solve a nonlinear system F(x, y) = 0, G(x, y) = 0 with Newton's method, which linearizes both equations at every step, and with modified Newton, which keeps the partial derivatives of the starting point. Then compare the results and iteration counts of the two methods.",
  "lab5.method.newton.tab": "5a · Newton",
  "lab5.method.newton.title": "Newton's method for nonlinear systems",
  "lab5.method.newton.name": "Newton's method",
  "lab5.method.newton.idea":
    "Around $(x_n, y_n)$, each of $F$ and $G$ is approximated by its tangent plane. The next iterate $(x_{n+1}, y_{n+1})$ is the point where both tangent planes reach zero, which is the solution of a 2×2 linear system. Solving that system with Cramer's rule gives the formulas below, where $F$, $G$ and the partial derivatives $F_x = \\partial F/\\partial x$, $F_y$, $G_x$, $G_y$ are evaluated at $(x_n, y_n)$, and $J$ is the Jacobian:",
  "lab5.method.newton.start":
    "The starting point $(x_0, y_0)$ has to be close enough to the solution, otherwise the method may not converge. Near a simple solution the convergence is quadratic: each step roughly doubles the number of correct digits.",
  "lab5.method.newton.failure":
    "If the Jacobian is zero at an iterate, the linear system has no unique solution, the next step cannot be computed and the method stops with an error. The exception is when $F$ and $G$ are both exactly 0 at $(x_n, y_n)$: the point is already the solution, and the iteration stays there.",
  "lab5.method.newton.chart":
    "The first chart draws the curves $F(x, y) = 0$ and $G(x, y) = 0$. The solution of the system is where they cross, and the path of the iterates shows how the method approaches it. The second chart shows, on a log scale, how the differences $|x_n - x_{n-1}|$ and $|y_n - y_{n-1}|$ shrink from step to step until they fall below $\\varepsilon$.",

  "lab5.method.modified.tab": "5b · Modified Newton",
  "lab5.method.modified.title": "Modified Newton's method",
  "lab5.method.modified.name": "Modified Newton",
  "lab5.method.modified.idea":
    "The method uses the same formulas as Newton's method, with one difference: the partial derivatives, and with them the Jacobian, are computed only once, at the starting point ($F_x^0 = F_x(x_0, y_0)$, and likewise for the others). Each step re-evaluates only $F$ and $G$ at $(x_n, y_n)$:",
  "lab5.method.modified.start":
    "Each step is therefore cheaper, but the convergence becomes linear and it takes more iterations than Newton's method. The starting point $(x_0, y_0)$ matters twice here: it has to be close enough to the solution, and it supplies the derivatives used for the whole run.",
  "lab5.method.modified.failure":
    "Since $J_0$ never changes, a zero Jacobian at the starting point stops the method with an error at the very first step. The exception is when $F$ and $G$ are both exactly 0 at an iterate $(x_n, y_n)$: the point is already the solution, and the iteration stays there.",
  "lab5.method.modified.chart":
    "The first chart draws the curves $F(x, y) = 0$ and $G(x, y) = 0$. The solution of the system is where they cross, and the path of the iterates shows how the method approaches it. The second chart shows, on a log scale, how the differences $|x_n - x_{n-1}|$ and $|y_n - y_{n-1}|$ shrink from step to step until they fall below $\\varepsilon$.",

  "lab5.preset.ex1": "Ex. 1: 2x³ − y² − 1 = 0, xy³ − y − 4 = 0, from (1.2, 1.7)",
  "lab5.preset.ex2First": "Ex. 2: x² + y² = 10, √(x + y) = 2, from (0.9, 3.1)",
  "lab5.preset.ex2Second": "Ex. 2: x² + y² = 10, √(x + y) = 2, from (2.9, 1.1)",
  "lab5.preset.ex3First": "Ex. 3: x² + y² = 10, √(x + y) = 2, from (0.9, 3.1)",
  "lab5.preset.ex3Second": "Ex. 3: x² + y² = 10, √(x + y) = 2, from (2.9, 1.1)",

  "lab5.compare.ex3": "Ex. 3: modified Newton on x² + y² = 10, √(x + y) = 2",
  "lab5.compare.ex3.task":
    "Apply modified Newton to the system x² + y² = 10, √(x + y) = 2 and compare the result and the number of iterations with Newton's method. It starts from (0.9, 3.1) and from (2.9, 1.1), each with three precisions.",

  "lab6.intro":
    "Solve nonlinear systems written as x = F(x, y), y = G(x, y) with successive approximations, and with the Gauss–Seidel method, which puts each new coordinate to work as soon as it is computed, for systems of three and of two equations. Then compare the iteration counts of the two methods.",
  "lab6.method.successive.tab": "6a · Successive approximations",
  "lab6.method.successive.title": "Successive approximations for nonlinear systems",
  "lab6.method.successive.name": "Successive approximations",
  "lab6.method.successive.idea":
    "The system is first rewritten as $x = F(x, y)$, $y = G(x, y)$, so its solution is a point that $F$ and $G$ leave unchanged. Starting from $(x_0, y_0)$, each step evaluates both functions at the current point:",
  "lab6.method.successive.start":
    "The first step, $(x_1, y_1) = (F(x_0, y_0), G(x_0, y_0))$, uses only the starting point. The method converges when, in a neighbourhood of the solution that contains $(x_0, y_0)$, the map $(x, y) \\mapsto (F(x, y), G(x, y))$ is a contraction with a constant $M < 1$. The convergence is linear: each step shrinks the error by a factor of about $M$, so the smaller $M$, the fewer iterations it takes.",
  "lab6.method.successive.failure":
    "If $F$ or $G$ is undefined at an iterate, such as a square root of a negative number, the method stops with an error. If the map is not a contraction near the solution, the iterates can drift away from it, and once a coordinate passes $10^{100}$ the method stops: the iteration diverges.",
  "lab6.method.successive.chart":
    "The first chart draws the curves $x = F(x, y)$ and $y = G(x, y)$. The solution of the system is where they cross, and the path of the iterates shows how the method approaches it. The second chart shows, on a log scale, how the differences $|x_n - x_{n-1}|$ and $|y_n - y_{n-1}|$ shrink from step to step until they fall below $\\varepsilon$.",

  "lab6.method.gaussSeidel3.tab": "6b · Gauss–Seidel, 3 equations",
  "lab6.method.gaussSeidel3.title": "The Gauss–Seidel method for three equations",
  "lab6.method.gaussSeidel3.name": "Gauss–Seidel, 3 equations",
  "lab6.method.gaussSeidel3.idea":
    "The system is written as $x = F_1(x, y, z)$, $y = F_2(x, y, z)$, $z = F_3(x, y, z)$. Gauss–Seidel works like successive approximations with one change: each new coordinate is used as soon as it is known. So $y_{n+1}$ already takes $x_{n+1}$, and $z_{n+1}$ takes both $x_{n+1}$ and $y_{n+1}$:",
  "lab6.method.gaussSeidel3.start":
    "The first step uses only the starting point: $x_1$, $y_1$ and $z_1$ are $F_1$, $F_2$ and $F_3$ evaluated at $(x_0, y_0, z_0)$. From $n = 1$ on, the formulas above apply. As with successive approximations, the method converges when the map is a contraction near the solution and the starting point is close enough, and the convergence is linear. Using the newest values usually saves iterations.",
  "lab6.method.gaussSeidel3.failure":
    "If $F_1$, $F_2$ or $F_3$ is undefined at an iterate, such as a square root of a negative number or the logarithm of a non-positive one, the method stops with an error. If the iterates drift away from the solution and a coordinate passes $10^{100}$, the method stops: the iteration diverges.",
  "lab6.method.gaussSeidel3.chart":
    "With three unknowns the path no longer fits on a plane, so the first chart follows $x_n$, $y_n$ and $z_n$ from step to step as they settle on the solution. The second chart shows, on a log scale, how the three differences shrink until all of them fall below $\\varepsilon$.",

  "lab6.method.gaussSeidel2.tab": "6c · Gauss–Seidel, 2 equations",
  "lab6.method.gaussSeidel2.title": "The Gauss–Seidel method for two equations",
  "lab6.method.gaussSeidel2.name": "Gauss–Seidel method",
  "lab6.method.gaussSeidel2.idea":
    "The system is written as $x = F(x, y)$, $y = G(x, y)$, as for successive approximations, with one change: $y_{n+1}$ is computed from the new $x_{n+1}$ instead of $x_n$. The newest value is put to work at once:",
  "lab6.method.gaussSeidel2.start":
    "The first step uses only the starting point, $(x_1, y_1) = (F(x_0, y_0), G(x_0, y_0))$, as in successive approximations. From $n = 1$ on, the formulas above apply. The method converges under the same contraction condition near the solution and the convergence is still linear, but usually with a smaller factor, so it takes fewer iterations.",
  "lab6.method.gaussSeidel2.failure":
    "If $F$ or $G$ is undefined at an iterate, such as a square root of a negative number, the method stops with an error. If the iterates drift away from the solution and a coordinate passes $10^{100}$, the method stops: the iteration diverges.",
  "lab6.method.gaussSeidel2.chart":
    "The first chart draws the curves $x = F(x, y)$ and $y = G(x, y)$. The solution of the system is where they cross, and the path of the iterates shows how the method approaches it. The second chart shows, on a log scale, how the differences $|x_n - x_{n-1}|$ and $|y_n - y_{n-1}|$ shrink from step to step until they fall below $\\varepsilon$.",

  "lab6.preset.ex1": "Ex. 1: 2x² − xy − 5x + 1 = 0, x + 3 lg x − y² = 0, from (3.5, 2.2)",
  "lab6.preset.ex2Near21": "Ex. 2: x² + y² = 5, xy = 2, near (2, 1)",
  "lab6.preset.ex2Near12": "Ex. 2: x² + y² = 5, xy = 2, near (1, 2)",
  "lab6.preset.ex2NearMinus1Minus2": "Ex. 2: x² + y² = 5, xy = 2, near (−1, −2)",
  "lab6.preset.ex2NearMinus2Minus1": "Ex. 2: x² + y² = 5, xy = 2, near (−2, −1)",
  "lab6.preset.ex3":
    "Ex. 3: 2x² − yz − 5x + 1 = 0, y² − 2x − ln z = 0, z² − xy − 2z − 8 = 0, from (10, 10, 10)",
  "lab6.preset.ex4": "Ex. 4: x² + y² = 5, xy = 2, near (2, 1)",

  "lab6.compare.ex4": "Ex. 4: Gauss–Seidel on x² + y² = 5, xy = 2",
  "lab6.compare.ex4.task":
    "Apply the Gauss–Seidel method to the system x² + y² = 5, xy = 2 near (2, 1), starting from (1.5, 1.5), and compare the number of iterations with successive approximations. Both methods run with three precisions.",
} as const;

export type MessageKey = keyof typeof en;
