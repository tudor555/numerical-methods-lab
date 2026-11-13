---
id: SPEC-numerical-methods-lab
companions:
  - labs-catalog.md
  - stack.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete contract for what to build, test, and validate.

# Numerical Methods Lab Hub

## Why

A **vision plus a mandate**. The course _Numerical Methods for Operator Equations_ has 13 lab assignments, and each one specifies an algorithm with its inputs, outputs, steps and worked examples. This project implements all 13 in one interactive web app. It must work as a university submission that is faithful to the lab specifications, and as a portfolio piece showing Next.js, React, TypeScript, numerical algorithms, data visualization and testing. When a trade-off comes up, mathematical correctness and fidelity to the lab come first, then clarity of explanation, then polish.

## Capabilities

- **CAP-1**
  - **intent:** A user can browse all 13 labs from a hub and open any one of them.
  - **success:** The hub lists labs 1–13 with title and topic; each opens a working lab page.
- **CAP-2**
  - **intent:** A user can read what each method does, including its iteration formula and starting/stopping rules, in readable math notation.
  - **success:** Every method in `labs-catalog.md` has an explanation with its formulas rendered correctly on its lab page.
- **CAP-3**
  - **intent:** A user can enter or edit every input a lab's algorithm declares, including typed math expressions, and can load any of the lab's worked examples with one click.
  - **success:** Each worked example in `labs-catalog.md` exists as a preset that fills the form. Invalid input (bad syntax, unknown variable, out-of-range number) is rejected next to the field before the run.
- **CAP-4**
  - **intent:** A user can run a method and see the final answer, the number of iterations, and every intermediate iterate or node value.
  - **success:** Running a preset shows the final value(s), n or m, and a full table of iterates or nodes that matches the lab's algorithm step for step.
- **CAP-5**
  - **intent:** A user can see how a run converged and, where an exact solution is known, how large the error is.
  - **success:** Iterative runs show |xₙ − xₙ₋₁| (or the per-component or max-norm difference) for each iteration. Runs with a known exact solution show exact value, approximation and error at each node.
- **CAP-6**
  - **intent:** A user can explore results in interactive charts wherever a chart explains the method.
  - **success:** Root-finding shows f with its iterates. 2-D systems show the iteration path. ODE and boundary-value labs plot the approximation against the exact solution, plus an error plot. All charts support zoom and hover.
- **CAP-7**
  - **intent:** Within a lab, a user can compare its methods, and several ε or h values, side by side, as the lab exercises require.
  - **success:** Each lab exercise that asks for a comparison (e.g. ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}, "compare with Newton", "compare with Euler") can be run as one comparison, showing iteration counts and/or errors next to each other.
- **CAP-8**
  - **intent:** A user can switch the whole interface and the method explanations between English and Romanian.
  - **success:** Switching language changes every UI string and explanation on the current page without losing the form inputs.
- **CAP-9**
  - **intent:** When a run cannot produce a valid result, the user gets a clear reason instead of a crash or a silent wrong number.
  - **success:** Divergence, reaching the iteration cap, a zero denominator (f′ = 0, Jacobian = 0, …), NaN/∞ and domain errors (√ of a negative, ln of a non-positive) each produce a specific message, and the partial iteration table stays visible.
- **CAP-10**
  - **intent:** Someone visiting the repository can understand what the project is and run it locally.
  - **success:** `README.md` describes the project and its 13 labs, shows a screenshot, lists the stack, and gives the Bun commands to install, run, test and format.

## Constraints

- Everything runs in the browser. No backend, database, accounts or server-side computation.
- Algorithms are pure TypeScript modules with no React or UI imports. The UI only calls them. Each module can be unit-tested alone.
- Algorithms follow the lab steps in `labs-catalog.md` exactly, including how x₀ is chosen, the stopping rule, the node layout and the special first-iterate step. Iteration counts must match what the lab's procedure produces. Source typos are handled as listed under Errata in `labs-catalog.md`.
- User-typed expressions are parsed with math.js in a restricted mode. Only the variables the lab declares are allowed (e.g. `x`; `x, y`; `t, x`), with no assignment, function definition or import. Any non-finite evaluation is an error.
- The stack is fixed as described in `stack.md`. Add a dependency only when the existing stack can't reasonably do the job.
- Build order: the foundation plus Lab 1 come first and set the reference pattern. The other labs reuse it.
- `labs-catalog.md` is the reference for every lab's methods, inputs, algorithm steps and worked examples.
- Every iterative method has a max-iteration cap the user can change, defaulting to 1000.
- Derivatives (f′, f″, partial derivatives) are entered by the user, as the labs specify. The app may pre-fill them using math.js `derivative()`.
- A single dark theme, Ember (see `stack.md`). There is no light theme.
- English is the default language, and the user's choice is remembered in their browser.

## Non-goals

- Methods, equation types or features that the 13 labs don't define. That includes adaptive step size, general ODE solver libraries and symbolic solving.
- Comparing across labs on a separate page. Comparison happens within a lab only.
- Saving runs, user accounts, sharing links or any server state.
- Reproducing the lecture notes in full. Explanations are short summaries written for the app.
- Offline/PWA support and native mobile apps. A responsive web layout is enough.
- Hosting or deployment. The app runs locally.
- A CI pipeline. Tests and formatting run locally (formatting through the pre-commit hook).

## Success signal

- Each of the 13 lab pages can load and run every worked example in `labs-catalog.md`, in English and Romanian, and the results match the lab: for example, Lab 6 ex. 1 converges to ≈ (3.487, 2.262), Lab 5 ex. 2 converges to (1, 3) and (3, 1), and the ODE/BVP presets show small errors against the exact solutions. A Vitest suite reproduces every preset for every algorithm.

## Assumptions

- Lab 4 ex. 2 ("√5 with a = 3") is a typo in the source. The presets cover √3 (a = 3) and √5 (a = 5).
- Lab 13 step 5 (`p[1] = ff[1]/2`) is a typo in the source. The app uses the standard Thomas step `p[1] = ff[1]/y[1]` and checks it against a direct solve of the tridiagonal system. Comparing with the exact solution can't catch this typo: both versions show ≈ 4·10⁻³ discretization error.
- The Lab 12 Green kernels are scaled by (b − a)³ so the method works on any [a, b]. On the lab's own interval, [0, 1], the results are identical.
- Lab 1 ex. 1 gives no interval, so the app uses [1, 2], as Labs 2–4 do. Lab 6 examples that give no ε use 10⁻⁴.
- "Compare with successive approximations" in Labs 1–2 means scalar fixed-point iteration xₙ₊₁ = φ(xₙ), with φ entered by the user. It lives in Lab 1.
- Lab 1 ex. 2 asks for the root in (−1, 1), but f″ changes sign inside that interval, so rule R0 picks x₀ = 1, where f′(1) = 0. The preset keeps the lab's interval and shows that error; a second preset starts from x₀ = 0 and converges to ≈ 0.20006.
- Lab 1 ex. 4 compares √2, √3 and √5 with successive approximations but gives neither φ nor ε. The app uses φ(x) = (x + c)/(x + 1) from x₀ = c, and the three ε values of ex. 1–2. The ∛ examples are approximated only, as the lab asks; they have no comparison.
