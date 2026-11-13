# Labs catalog

The methods, inputs, algorithm steps and worked examples for each of the 13 labs.

## Shared rules

- **Stopping rule (iterative methods):** keep iterating while |xₙ − xₙ₋₁| ≥ ε. For systems, keep going while _any_ component difference is ≥ ε. Output n and xₙ.
- **First iterate:** most algorithms compute x₁ from x₀ as a separate step, then loop from n = 1. Iteration counts depend on this, so keep it.
- **Rule R0 (choosing x₀):** x₀ = a if f(a)·f″(a) > 0, otherwise x₀ = b. Here f″(a) is either the input value `dda` or the expression `ddf` evaluated at a.
- **Cauchy problem nodes (Labs 7–9):** inputs x₀, y₀, T, n; h = T/n; xᵢ = x₀ + i·h; output yᵢ for i = 1..n.
- **ε presets:** "ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}" means run once per value and compare the iteration counts (CAP-7).

---

## Lab 1: Newton (tangent) method; computing roots

**1a. Newton.** xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). Inputs: a, b, f, f′, ε, dda = f″(a). x₀ comes from R0, and the user can also enter x₀ directly (needed for the Kepler example).
**1b. k-th root of c.** f(x) = xᵏ − c, f′ = k·xᵏ⁻¹, so xₙ = [(k−1)·xₙ₋₁ + c / xₙ₋₁ᵏ⁻¹] / k. x₀ = c if c > 1, otherwise x₀ = 1. Inputs: c, k, ε.
**1c. Successive approximations (scalar, for comparison).** xₙ₊₁ = φ(xₙ). Inputs: φ, x₀, ε.

Examples (ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²} unless stated):

1. x³ − x − 1 = 0 on [1, 2].
2. x⁵ − 5x + 1 = 0, root in (−1, 1).
3. Kepler: x = sin x + 0.25 on (π/4, π/2), so f = x − sin x − 0.25. Start at x₀ = 3π/8 ≈ 1.1781 with ε = 10⁻⁴. Compare with 1c using φ(x) = sin x + 0.25.
4. √2, √3, √5 with 1b (k = 2), compared with 1c. ∛2, ∛3, ∛12 with 1b (k = 3).

## Lab 2: Secant and Steffensen methods

**2a. Secant.** xₙ₊₁ = xₙ − f(xₙ)(xₙ − xₙ₋₁) / (f(xₙ) − f(xₙ₋₁)). Inputs: a, b, f, ε, x₀, x₁ (the loop starts at n = 1).
**2b. Steffensen.** xₙ₊₁ = xₙ − f(xₙ)² / (f(xₙ + f(xₙ)) − f(xₙ)). Inputs: a, b, f, ε, dda. x₀ comes from R0.

Examples (ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}, compare with Newton):

1. Secant, f = x² − 2, [1, 2], x₀ = 2, x₁ = 1.4.
2. Secant, f = x³ − x − 1, [1, 2], x₀ = 2, x₁ = 1.5.
3. Steffensen, f = x³ − x − 1, [1, 2], x₀ = 2.

## Lab 3: Halley and Chebyshev methods

**3a. Halley.** xₙ₊₁ = xₙ − 2f f′ / (2f′² − f f″), all evaluated at xₙ. Inputs: a, b, f, f′, f″, ε. x₀ comes from R0 using f″(a), or the user enters it directly.
**3b. Chebyshev.** xₙ₊₁ = xₙ − f/f′ − f² f″ / (2f′³). Inputs: a, b, f, f′, f″, ε, x₀.

Examples (ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}, compare with Newton):

1. Halley, f = x² − 2, f′ = 2x, f″ = 2, [1, 2], x₀ = 2.
2. Halley, f = x³ − x − 1, f′ = 3x² − 1, f″ = 6x, [1, 2], x₀ = 2.
3. Chebyshev, f = x³ − x − 1 (same derivatives), [1, 2], x₀ = 2.

## Lab 4: Third-order iterative methods

**4a. Combined tangent method.** xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ) − f(xₙ − f(xₙ)/f′(xₙ)) / f′(xₙ). Inputs: a, b, f, f′, ε, x₀ (chosen so that f(x₀)f″(x₀) > 0).
**4b. Third-order square root.** xₙ₊₁ = xₙ(xₙ² + 3a) / (3xₙ² + a) → √a. x₀ = a. Inputs: a, ε.

Examples (ε ∈ {10⁻⁴, 10⁻⁸, 10⁻¹²}):

1. 4a, f = x² − 2, f′ = 2x, [1, 2], x₀ = 2. Compare with Newton.
2. 4a, f = x³ − x − 1, f′ = 3x² − 1, [1, 2], x₀ = 2. Compare with Newton.
3. 4b, √2 (a = 2). Compare with 1b.
4. 4b, √3 (a = 3) and √5 (a = 5). Compare with 1b. See Errata.

## Lab 5: Newton's method for 2×2 nonlinear systems

Solves F(x, y) = 0, G(x, y) = 0. Inputs: x₀, y₀, F, G, Fₓ, F_y, Gₓ, G_y, ε.
**5a. Newton.** J = Fₓ G_y − F_y Gₓ.
xₙ₊₁ = xₙ − (F·G_y − G·F_y)/J, yₙ₊₁ = yₙ − (Fₓ·G − Gₓ·F)/J, with everything evaluated at (xₙ, yₙ).
**5b. Modified Newton.** Same as 5a, except the partial derivatives and J stay fixed at (x₀, y₀). F and G are still evaluated at (xₙ, yₙ).

Examples (ε = 10⁻⁴):

1. F = 2x³ − y² − 1, G = xy³ − y − 4. Fₓ = 6x², F_y = −2y, Gₓ = y³, G_y = 3xy² − 1. Start at (1.2, 1.7).
2. x² + y² = 10, √(x+y) = 2: F = x² + y² − 10, G = √(x+y) − 2. Fₓ = 2x, F_y = 2y, Gₓ = G_y = 1/(2√(x+y)). Start at (0.9, 3.1), which should reach exactly (1, 3), and at (2.9, 1.1), which should reach exactly (3, 1).
3. 5b on example 2. Compare the result and the iteration count with 5a.

## Lab 6: Successive approximations and Gauss–Seidel for nonlinear systems

**6a. Successive approximations (2-D).** The system is written as x = F(x, y), y = G(x, y). xₙ₊₁ = F(xₙ, yₙ), yₙ₊₁ = G(xₙ, yₙ). Inputs: x₀, y₀, F, G, ε.
**6b. Gauss–Seidel (3-D).** x = F₁, y = F₂, z = F₃.
Step 1 (as written in the lab) uses only the starting values: x₁ = F₁(x₀,y₀,z₀), y₁ = F₂(x₀,y₀,z₀), z₁ = F₃(x₀,y₀,z₀).
For n ≥ 1: xₙ₊₁ = F₁(xₙ,yₙ,zₙ), yₙ₊₁ = F₂(xₙ₊₁,yₙ,zₙ), zₙ₊₁ = F₃(xₙ₊₁,yₙ₊₁,zₙ). Stop when all three differences are below ε.
**6c. Gauss–Seidel (2-D).** x₁ = F(x₀,y₀), y₁ = G(x₀,y₀). Then xₙ₊₁ = F(xₙ,yₙ), yₙ₊₁ = G(xₙ₊₁,yₙ).

Examples:

1. 6a: 2x² − xy − 5x + 1 = 0, x + 3 lg x − y² = 0 (lg = log₁₀). F = √((x(y+5) − 1)/2), G = √(x + 3 lg x). Start at (3.5, 2.2), ε = 10⁻⁴. The lab says (x₆, y₆) ≈ (3.487, 2.262) already has 4 correct significant digits. With ε = 10⁻⁴ the stopping rule stops at n = 9, at ≈ (3.48727, 2.26155). The neighbourhood V = {|x−x₀| ≤ 0.1, |y−y₀| ≤ 0.1} has contraction constant M = 0.81 < 1.
2. 6a: x² + y² = 5, xy = 2, with solutions (±2, ±1) and (±1, ±2) (same signs). Near (2, 1): F = √(5 − y²), G = 2/x. Near (1, 2): F = 2/y, G = √(5 − x²). Near (−1, −2): F = 2/y, G = −√(5 − x²). Near (−2, −1): F = −√(5 − y²), G = 2/x. ε = 10⁻⁴, start at (1.5, 1.5).
3. 6b: 2x² − yz − 5x + 1 = 0, y² − 2x − ln z = 0, z² − xy − 2z − 8 = 0. F₁ = √(0.5(yz + 5x − 1)), F₂ = √(2x + ln z), F₃ = √(xy + 2z + 8). Start at (10, 10, 10), ε = 0.001.
4. 6c on the system of example 2 near (2, 1), starting at (1.5, 1.5) with ε = 10⁻⁴. Compare the iteration count with 6a.

## Lab 7: Euler-type methods (Cauchy problem y′ = f(x, y))

Uses the shared node rules for the Cauchy problem.
**7a. Euler.** yᵢ = yᵢ₋₁ + h f(xᵢ₋₁, yᵢ₋₁).
**7b. Modified Euler (midpoint).** K = f(xᵢ₋₁, yᵢ₋₁), U = f(xᵢ₋₁ + h/2, yᵢ₋₁ + (h/2)K), yᵢ = yᵢ₋₁ + hU.
**7c. Euler–Heun.** K₁ = f(xᵢ₋₁, yᵢ₋₁), K₂ = f(xᵢ₋₁ + h, yᵢ₋₁ + hK₁), yᵢ = yᵢ₋₁ + (h/2)(K₁ + K₂).

Examples (show exact value, approximation and error at each node):

1. 7a: y′ = x² − y, y(0) = 1, x ∈ [0, 4], h ∈ {1/4, 1/8, 1/16}. Exact y = x² − 2x + 2 − e⁻ˣ.
2. 7a, 7b, 7c: y′ = y + x, y(0) = 1, x ∈ [0, 1], h = 0.1 (n = 10). Exact y = 2eˣ − x − 1. Compare all three methods.

## Lab 8: Runge–Kutta methods of order 2 and 3

All methods use K₁ = f(xᵢ₋₁, yᵢ₋₁) and the shared node rules.
**8a. Heun (1900).** K₂ = f(x + 2h/3, y + (2h/3)K₁). yᵢ = yᵢ₋₁ + (h/4)(K₁ + 3K₂).
**8b. RK order 2.** K₂ = f(x + 3h/4, y + (3h/4)K₁). yᵢ = yᵢ₋₁ + (h/3)(K₁ + 2K₂).
**8c. Runge–Simpson (order 3).** K₂ = f(x + h/2, y + (h/2)K₁), K₃ = f(x + h, y + h(2K₂ − K₁)). yᵢ = yᵢ₋₁ + (h/6)(K₁ + 4K₂ + K₃).
**8d. Runge (1895, order 3).** K₂ = f(x + h/2, y + (h/2)K₁), K₃ = f(x + h, y + hK₁), K₄ = f(x + h, y + hK₃). yᵢ = yᵢ₋₁ + (h/6)(K₁ + 4K₂ + K₄).
Here x and y mean xᵢ₋₁ and yᵢ₋₁.

Example: y′ = y + x, y(0) = 1, [0, 1], h = 0.1. Exact y = 2eˣ − x − 1. Compare 8a–8d with each other and with Euler.

## Lab 9: Runge–Kutta methods of order 4

**9a. Classic RK4 (Kutta).** K₁ = h f(x, y), K₂ = h f(x + h/2, y + K₁/2), K₃ = h f(x + h/2, y + K₂/2), K₄ = h f(x + h, y + K₃). yᵢ = yᵢ₋₁ + (K₁ + 2K₂ + 2K₃ + K₄)/6.
**9b. RK "3/8 rule".** K₁ = f(x, y), K₂ = f(x + h/3, y + (h/3)K₁), K₃ = f(x + 2h/3, y + h(−K₁/3 + K₂)), K₄ = f(x + h, y + h(K₁ − K₂ + K₃)). yᵢ = yᵢ₋₁ + (h/8)(K₁ + 3K₂ + 3K₃ + K₄).

Examples:

1. 9a and 9b: y′ = y + x, y(0) = 1, [0, 1], h = 0.1. Exact y = 2eˣ − x − 1. Compare with Heun and with RK of orders 2 and 3.
2. 9a: y′ = 1/(1 + x²) − 2y², y(0) = 0, [0, 4], h = 1/4 (n = 16). Exact y = x/(1 + x²). Watch how the error grows with distance from x₀.

## Lab 10: Successive approximations (Picard with the trapezoidal rule) for first-order Cauchy problems

Inputs: a, b, y₀, ε, n, f. h = (b − a)/n, xᵢ = a + ih.
y[0, i] = y₀ for all i. y[1, 0] = y₀, and y[1, i] = y₀ + ((b−a)/(2n)) Σⱼ₌₁ⁱ [f(xⱼ₋₁, y₀) + f(xⱼ, y₀)].
Starting at m = 1, keep going while maxᵢ₌₁..ₙ |y[m, i] − y[m−1, i]| ≥ ε:
y[m+1, 0] = y₀, y[m+1, i] = y₀ + ((b−a)/(2n)) Σⱼ₌₁ⁱ [f(xⱼ₋₁, y[m, j−1]) + f(xⱼ, y[m, j])].
Output: the last iteration m and y[m, i].

Examples (ε = 10⁻¹⁴):

1. y′ = y + x, y(0) = 1, [0, 1], n = 10, then n = 20. Exact y = 2eˣ − x − 1. Compare with RK4, and report the iteration where it stops and the error.
2. y′ = 1/(1 + x²) − 2y², y(0) = 0, [0, 4], n = 16. Exact y = x/(1 + x²).

## Lab 11: Successive approximations for second-order boundary-value problems

Solves x″ = f(t, x), x(a) = α, x(b) = β. Inputs: a, b, α, β, ε, n, f. tᵢ = a + i(b − a)/n.
Let L(tᵢ) = ((tᵢ − a)/(b − a))·β + ((b − tᵢ)/(b − a))·α. Start with x[0, i] = L(tᵢ).
Starting at m = 1, keep going while maxᵢ₌₁..ₙ₋₁ |x[m, i] − x[m−1, i]| ≥ ε:
x[m+1, 0] = α, x[m+1, n] = β, and for i = 1..n−1:

```text
x[m+1, i] = L(tᵢ)
  − ((b−a)/(2n)) Σⱼ₌₁ⁱ   [ (tⱼ₋₁−a)(b−tᵢ)/(b−a) · f(tⱼ₋₁, x[m, j−1]) + (tⱼ−a)(b−tᵢ)/(b−a) · f(tⱼ, x[m, j]) ]
  − ((b−a)/(2n)) Σⱼ₌ᵢ₊₁ⁿ [ (tᵢ−a)(b−tⱼ₋₁)/(b−a) · f(tⱼ₋₁, x[m, j−1]) + (tᵢ−a)(b−tⱼ)/(b−a) · f(tⱼ, x[m, j]) ]
```

Output: m and x[m, i] for i = 0..n.

Examples (n = 10, ε = 10⁻¹⁴):

1. f = (2/3)eᵗ + (1/3)x, [0, 1], α = 1, β = e. Exact x = eᵗ.
2. f = −(1/2)cos t − (1/2)x, [0, π/4], α = 1, β = √2/2. Exact x = cos t.

## Lab 12: Green's function method for boundary-value and higher-order Cauchy problems

**12a. Successive approximations, second-order Cauchy problem** y″ = f(x, y), y(a) = y₀, y′(a) = y₀′. Inputs: a, b, y₀, y₀′, ε, n, f. h = (b − a)/n.
y[0, i] = y₀ + (xᵢ − x₀)·y₀′. For m ≥ 1: y[m, 0] = y₀, and
y[m, i] = y[0, i] + (h/2) Σⱼ₌₁ⁱ [ (xᵢ − xⱼ₋₁) f(xⱼ₋₁, y[m−1, j−1]) + (xᵢ − xⱼ) f(xⱼ, y[m−1, j]) ],
until |y[m, i] − y[m−1, i]| < ε for every i = 1..n.
Example: f = (2/3)eˣ + (1/3)y, [0, 1], y₀ = y₀′ = 1, n = 10, ε = 10⁻¹⁴. Exact y = eˣ.

**12b. Green's function, fourth-order boundary-value problem** x⁗ = f(t, x), x(a) = c, x(b) = d, x′(a) = w, x′(b) = r. Inputs: a, b, c, d, w, r, ε, n, f. tᵢ = a + i(b − a)/n.
Let τ = (t − a)/(b − a) and σ = (s − a)/(b − a).
H(t, s) = ((b − a)³/6)·σ²·(1 − τ)²·((τ − σ) + 2(1 − σ)τ). Used for s ≤ t.
K(t, s) = ((b − a)³/6)·τ²·(1 − σ)²·((σ − τ) + 2(1 − τ)σ). Used for s ≥ t.
The lab writes the factor as 1/6, which is the same thing on [0, 1]. The (b − a)³ factor makes it correct on any interval: on [0, 0.5] and [0, 1.5] the error drops from ~10⁻² to ≤ 4·10⁻⁶.
gᵢ = (b−tᵢ)²[2(tᵢ−a) + (b−a)]/(b−a)³ · c + (tᵢ−a)²[2(b−tᵢ) + (b−a)]/(b−a)³ · d + (b−tᵢ)²(tᵢ−a)/(b−a)² · w − (tᵢ−a)²(b−tᵢ)/(b−a)² · r.
x[0, i] = gᵢ. For m ≥ 1: x[m, 0] = c, x[m, n] = d, and for i = 1..n−1:

```text
x[m, i] = gᵢ
  + ((b−a)/(2n)) Σⱼ₌₁ⁱ   [ H(tᵢ, tⱼ₋₁) f(tⱼ₋₁, x[m−1, j−1]) + H(tᵢ, tⱼ) f(tⱼ, x[m−1, j]) ]
  + ((b−a)/(2n)) Σⱼ₌ᵢ₊₁ⁿ [ K(tᵢ, tⱼ₋₁) f(tⱼ₋₁, x[m−1, j−1]) + K(tᵢ, tⱼ) f(tⱼ, x[m−1, j]) ]
```

Stop when |x[m, i] − x[m−1, i]| < ε for every i = 1..n−1.

Example: x⁗ = 23/(t+1)⁵ + x⁵, [0, 1], c = 1, d = 1/2, w = −1, r = −1/4, n = 10, ε = 10⁻¹⁴. Exact x = 1/(t + 1).

## Lab 13: Finite differences for linear second-order boundary-value problems

Solves −x″ + r(t)x = f(t), x(a) = x(b) = 0. Inputs: a, b, n, r, f. The tridiagonal system is solved with the Thomas algorithm.
h = (b − a)/n, z = −1, tᵢ = a + ih.
For i = 1..n−1: rrᵢ = r(tᵢ)h², ffᵢ = f(tᵢ)h², yᵢ = 2 + rrᵢ.
u₁ = z/y₁. For i = 2..n−2: wᵢ = yᵢ − uᵢ₋₁z, uᵢ = z/wᵢ. Then w_{n−1} = y_{n−1} − u_{n−2}z.
p₁ = ff₁/y₁ (see Errata). For i = 2..n−1: pᵢ = (ffᵢ − z·pᵢ₋₁)/wᵢ.
v₀ = vₙ = 0, v_{n−1} = p_{n−1}, and for i = n−2 down to 1: vᵢ = pᵢ − uᵢvᵢ₊₁. Output vᵢ for i = 0..n.
Example: r = 1, f = 2e⁻ᵗ cos t + e⁻ᵗ sin t, [0, π], n = 10. Exact x = e⁻ᵗ sin t.

---

## Errata (source vs. implementation)

| Lab | Source says                                  | Implement                                                         | Why                                                                                                                                                                    |
| --- | -------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | Ex. 2: "approximate √5 taking a = 3"         | Presets for √3 (a = 3) and √5 (a = 5)                             | 4b converges to √a, so the source is inconsistent                                                                                                                      |
| 13  | Step 5: p[1] = ff[1]/2                       | p[1] = ff[1]/y[1] (with w₁ = y₁)                                  | Standard Thomas forward sweep. The source value is only right when r(t₁) = 0. Test against a direct tridiagonal solve: the exact-solution error is ≈ 4·10⁻³ either way |
| 1   | Ex. 1: no interval given                     | [1, 2]                                                            | Same equation and interval as Labs 2–4                                                                                                                                 |
| 1   | Ex. 2: root in (−1, 1) with rule R0          | Keep [−1, 1] (R0 stops at f′(1) = 0) and add a preset with x₀ = 0 | f″ changes sign inside the interval, so R0 picks b = 1, where the tangent is horizontal                                                                                |
| 6   | Ex. 1–2: no ε or starting point for 6a ex. 2 | ε = 10⁻⁴, start at (1.5, 1.5)                                     | Matches the 6c comparison example                                                                                                                                      |
