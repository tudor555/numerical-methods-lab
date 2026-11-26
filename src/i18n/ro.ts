import type { MessageKey } from "./en";

/**
 * Romanian dictionary. The type requires exactly the keys of `en`.
 * Romanian is the language the app is evaluated in: write it as a native speaker would,
 * with the course's own terms (date de intrare, precizia, iterația inițială, exemple numerice).
 * Display text uses the Romanian decimal comma and `;` between interval ends.
 */
export const ro: Record<MessageKey, string> = {
  "app.name": "Laborator de metode numerice",
  "app.tagline": "Vezi cum converg metodele numerice, iterație cu iterație.",
  "lang.label": "Limba",
  "lang.en": "Engleză",
  "lang.ro": "Română",

  "notFound.title": "Pagina nu a fost găsită",
  "notFound.body": "Această pagină nu există sau laboratorul nu este încă disponibil.",
  "notFound.back": "Înapoi la laboratoare",

  "hub.title": "Laboratoare",
  "hub.intro":
    "Alege o metodă, scrie propria funcție sau încarcă un exemplu numeric și urmărește fiecare pas: fiecare iterație, cât de repede scade eroarea și cum se compară metodele între ele.",
  "hub.lab": "Laboratorul {n}",
  "hub.open": "Deschide laboratorul",
  "hub.comingSoon": "În curând",

  "lab1.title": "Metoda tangentei și rădăcinile de ordinul k",
  "lab1.topic": "Metoda lui Newton, rădăcini de ordinul k, aproximații succesive",
  "lab2.title": "Metoda secantei și metoda lui Steffensen",
  "lab2.topic": "Metode fără derivată pentru ecuația f(x) = 0",
  "lab3.title": "Metoda lui Halley și metode de tip Cebîșev",
  "lab3.topic": "Generalizări ale metodei tangentei",
  "lab4.title": "Metode iterative de ordinul trei",
  "lab4.topic": "Metoda combinată a tangentei și calculul radicalilor cu metoda de ordinul 3",
  "lab5.title": "Metoda lui Newton pentru sisteme 2×2",
  "lab5.topic": "Metoda lui Newton și metoda Newton modificată pentru sisteme neliniare",
  "lab6.title": "Aproximații succesive și metoda Gauss–Seidel",
  "lab6.topic": "Sisteme neliniare cu două și trei necunoscute",
  "lab7.title": "Metode de tip Euler",
  "lab7.topic": "Metoda lui Euler, Euler modificată și Euler–Heun pentru y′ = f(x, y)",
  "lab8.title": "Metode Runge–Kutta de ordinul 2 și 3",
  "lab8.topic": "Metoda lui Heun, RK2, Runge–Simpson și Runge (1895)",
  "lab9.title": "Metode Runge–Kutta de ordinul 4",
  "lab9.topic": "Metoda Runge–Kutta clasică și regula 3/8",
  "lab10.title": "Metoda aproximațiilor succesive și formula trapezelor",
  "lab10.topic": "Probleme Cauchy de ordinul întâi",
  "lab11.title": "Aproximații succesive pentru probleme bilocale",
  "lab11.topic": "Probleme de ordinul doi x″ = f(t, x)",
  "lab12.title": "Metoda funcției Green",
  "lab12.topic": "Probleme Cauchy de ordinul doi și probleme bilocale de ordinul patru",
  "lab13.title": "Metoda diferențelor finite",
  "lab13.topic": "Probleme bilocale liniare de ordinul doi și algoritmul lui Thomas",

  "lab.back": "Toate laboratoarele",
  "lab.number": "Laboratorul {n}",
  "lab.section.explanation": "Cum funcționează",
  "lab.section.parameters": "Date de intrare",
  "lab.section.results": "Rezultate",
  "lab.section.comparison": "Comparații",
  "lab.presets": "Exemple numerice",
  "lab.methods": "Metode",

  "common.stopping":
    "Criteriul de oprire: primul pas, de la $x_0$ la $x_1$, se face întotdeauna. Apoi, începând cu $n = 1$, iterațiile continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$, adică până când două iterații consecutive diferă cu mai puțin de $\\varepsilon$. Se afișează $n$ și $x_n$.",
  "common.systemStopping":
    "Criteriul de oprire: primul pas, de la $(x_0; y_0)$ la $(x_1; y_1)$, se face întotdeauna. Apoi, începând cu $n = 1$, iterațiile continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$ sau $|y_n - y_{n-1}| \\ge \\varepsilon$, adică până când ambele coordonate se modifică cu mai puțin de $\\varepsilon$. Se afișează $n$ și $(x_n; y_n)$.",
  "common.system3Stopping":
    "Criteriul de oprire: primul pas, de la $(x_0; y_0; z_0)$ la $(x_1; y_1; z_1)$, se face întotdeauna. Apoi, începând cu $n = 1$, iterațiile continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$, $|y_n - y_{n-1}| \\ge \\varepsilon$ sau $|z_n - z_{n-1}| \\ge \\varepsilon$, adică până când toate cele trei coordonate se modifică cu mai puțin de $\\varepsilon$. Se afișează $n$ și $(x_n; y_n; z_n)$.",

  "math.if": "dacă",

  "form.run": "Calculează",
  "form.blocked": "Corectează câmpurile marcate ca să poți calcula.",
  "form.derive": "Calculează din {source}",
  "form.exprHint":
    "Variabile: {vars}. Funcții: sin, cos, exp, ln, lg, sqrt și altele. Constante: pi, e.",
  "form.numberHint": "Un număr sau o expresie, de exemplu 3*pi/8 sau 1e-4.",

  "field.f": "Funcția",
  "field.df": "Derivata funcției",
  "field.a": "Capătul stâng al intervalului",
  "field.b": "Capătul drept al intervalului",
  "field.x0Mode": "Iterația inițială",
  "field.x0Mode.r0": "Regula R0",
  "field.x0Mode.manual": "Introdusă manual",
  "field.dda": "Valoarea derivatei a doua în a",
  "field.ddf": "Derivata a doua a funcției",
  "field.x0": "Iterația inițială",
  "field.x1": "A doua iterație inițială",
  "field.eps": "Precizia dorită",
  "field.maxIter": "Numărul maxim de iterații",
  "field.c": "Numărul de sub radical",
  "field.k": "Ordinul rădăcinii",
  "field.phi": "Funcția de iterație",
  "field.F": "Funcția F",
  "field.G": "Funcția G",
  "field.partial": "Derivata parțială",
  "field.startX": "Punctul inițial, x",
  "field.startY": "Punctul inițial, y",
  "field.F1": "Funcția F₁",
  "field.F2": "Funcția F₂",
  "field.F3": "Funcția F₃",
  "field.startZ": "Punctul inițial, z",
  "field.cauchyX0": "Punctul inițial",
  "field.cauchyY0": "Valoarea inițială",
  "field.T": "Lungimea intervalului",
  "field.steps": "Numărul de pași, h = T/n",
  "field.fxy": "Membrul drept al ecuației y′ = f(x, y)",
  "field.exactY": "Soluția exactă",
  "field.optional": "opțional",

  "field.error.empty": "Câmpul este obligatoriu.",
  "field.error.syntax": "Expresia nu este scrisă corect. Verifică operatorii și parantezele.",
  "field.error.unknown-symbol": "Simbolul „{name}” nu este recunoscut. Poți folosi: {allowed}.",
  "field.error.unknown-function": "Funcția „{name}” nu este disponibilă.",
  "field.error.forbidden":
    "„{name}” nu este permis aici. Folosește doar operații aritmetice, funcțiile din listă și variabilele indicate.",
  "field.error.not-finite": "Valoarea trebuie să fie un număr finit.",
  "field.error.not-differentiable": "Această expresie nu poate fi derivată automat.",
  "field.error.positive": "Valoarea trebuie să fie strict pozitivă.",
  "field.error.min": "Valoarea trebuie să fie cel puțin {min}.",
  "field.error.range": "Valoarea trebuie să fie între {min} și {max}.",
  "field.error.positive-max": "Valoarea trebuie să fie strict pozitivă și cel mult {max}.",
  "field.error.integer-min": "Valoarea trebuie să fie un număr întreg, cel puțin {min}.",
  "field.error.integer-range": "Valoarea trebuie să fie un număr întreg între {min} și {max}.",
  "field.error.greater-than": "Valoarea trebuie să fie mai mare decât {other}.",
  "field.error.different-from": "Valoarea trebuie să fie diferită de {other}.",
  "field.error.derive-failed":
    "Corectează mai întâi funcția (și capătul a) sau introdu valoarea manual.",
  "field.error.derive-undefined":
    "Derivata nu este definită în acest punct. Introdu valoarea manual.",

  "result.empty": "Alege un exemplu numeric sau modifică datele de intrare, apoi apasă Calculează.",
  "result.status.converged": "Converge",
  "result.status.max-iterations": "Numărul maxim de iterații a fost atins",
  "result.status.error": "Eroare",
  "result.value": "Aproximația",
  "result.iterations": "Numărul de iterații",
  "result.start": "Iterația inițială",
  "result.startRule": "aleasă prin regula R0 (x₀ = {end})",
  "result.exact": "Valoarea exactă",
  "result.error": "Eroarea",
  "result.converged": "Precizia dorită a fost atinsă la iterația n = {n}: |xₙ − xₙ₋₁| < ε.",
  "result.maxIterations":
    "Calculul s-a oprit la limita de iterații (n = {n}), înainte ca |xₙ − xₙ₋₁| să scadă sub ε. Ultima iterație este afișată, dar nu atinge precizia dorită.",
  "result.partial": "Iterațiile calculate până la eroare sunt afișate mai jos.",
  "result.system.converged":
    "Precizia dorită a fost atinsă la iterația n = {n}: |xₙ − xₙ₋₁| < ε și |yₙ − yₙ₋₁| < ε.",
  "result.system.maxIterations":
    "Calculul s-a oprit la limita de iterații (n = {n}), înainte ca |xₙ − xₙ₋₁| și |yₙ − yₙ₋₁| să scadă sub ε. Ultima iterație este afișată, dar nu atinge precizia dorită.",
  "result.system3.converged":
    "Precizia dorită a fost atinsă la iterația n = {n}: |xₙ − xₙ₋₁| < ε, |yₙ − yₙ₋₁| < ε și |zₙ − zₙ₋₁| < ε.",
  "result.system3.maxIterations":
    "Calculul s-a oprit la limita de iterații (n = {n}), înainte ca |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| și |zₙ − zₙ₋₁| să scadă sub ε. Ultima iterație este afișată, dar nu atinge precizia dorită.",
  "result.startPoint": "Punctul inițial",
  "result.exactSolution": "Soluția exactă",
  "result.status.completed": "Calcul încheiat",
  "result.cauchy.completed":
    "Au fost calculate y₁, …, yₙ în nodurile x₁, …, xₙ, cu pasul h = {h} (n = {n}).",
  "result.cauchy.partial": "Nodurile calculate până la eroare sunt afișate mai jos.",
  "result.stepH": "Pasul",
  "result.steps": "Numărul de pași",
  "result.valueAtEnd": "Aproximația în x₀ + T",
  "result.maxError": "Eroarea maximă în noduri",

  "run.error.zero-derivative":
    "Derivata se anulează la n = {n}, în xₙ = {x}: tangenta este orizontală, deci xₙ₊₁ nu poate fi calculat.",
  "run.error.zero-denominator":
    "Numitorul se anulează la n = {n}, în xₙ = {x}: f ia aceeași valoare în ambele puncte, deci xₙ₊₁ nu poate fi calculat.",
  "run.error.undefined-value":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare nu este definită (NaN). Verifică domeniul de definiție al funcțiilor (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.error.overflow":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare a devenit infinită (±∞).",
  "run.error.diverged": "Șirul iterațiilor diverge: |xₙ| a depășit 10¹⁰⁰ la n = {n} (xₙ = {x}).",
  "run.systemError.zero-jacobian":
    "Jacobianul J se anulează la n = {n}, în (xₙ; yₙ) = {point}: pasul ar împărți la zero, deci (xₙ₊₁; yₙ₊₁) nu poate fi calculat.",
  "run.systemError.undefined-value":
    "La pasul care pornește din n = {n}, (xₙ; yₙ) = {point}, o valoare nu este definită (NaN). Verifică domeniul de definiție al funcțiilor (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.systemError.overflow":
    "La pasul care pornește din n = {n}, (xₙ; yₙ) = {point}, o valoare a devenit infinită (±∞).",
  "run.systemError.diverged":
    "Șirul iterațiilor diverge: la n = {n}, în (xₙ; yₙ) = {point}, |xₙ| sau |yₙ| a depășit 10¹⁰⁰.",
  "run.system3Error.undefined-value":
    "La pasul care pornește din n = {n}, (xₙ; yₙ; zₙ) = {point}, o valoare nu este definită (NaN). Verifică domeniul de definiție al funcțiilor (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.system3Error.overflow":
    "La pasul care pornește din n = {n}, (xₙ; yₙ; zₙ) = {point}, o valoare a devenit infinită (±∞).",
  "run.system3Error.diverged":
    "Șirul iterațiilor diverge: la n = {n}, în (xₙ; yₙ; zₙ) = {point}, |xₙ|, |yₙ| sau |zₙ| a depășit 10¹⁰⁰.",
  "run.cauchyError.undefined-value":
    "La pasul care pornește din nodul i = {i}, cu xᵢ = {x} și yᵢ = {y}, o valoare nu este definită (NaN). Verifică domeniul de definiție al lui f (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.cauchyError.overflow":
    "La pasul care pornește din nodul i = {i}, cu xᵢ = {x} și yᵢ = {y}, o valoare a devenit infinită (±∞).",
  "run.cauchyError.diverged":
    "Aproximațiile cresc nemărginit: |yᵢ| a depășit 10¹⁰⁰ în nodul i = {i} (xᵢ = {x}, yᵢ = {y}).",

  "table.title": "Tabelul iterațiilor",
  "table.hidden": "Iterații ascunse: {count}",
  "table.showAll": "Arată toate",
  "table.hiddenNodes": "Noduri ascunse: {count}",
  "table.node": "Valorile în noduri",

  "chart.tangent": "Graficul lui f și tangentele succesive",
  "chart.secant": "Graficul lui f și secantele succesive",
  "chart.steffensen": "Graficul lui f și pașii metodei lui Steffensen",
  "chart.halley": "Graficul lui f și hiperbolele tangente",
  "chart.chebyshev": "Graficul lui f și parabolele tangente",
  "chart.combinedTangent": "Graficul lui f și pașii metodei combinate a tangentei",
  "chart.cobweb": "Graficul lui φ, dreapta y = x și traseul iterațiilor",
  "chart.convergence": "Convergența: |xₙ − xₙ₋₁| pe scară logaritmică",
  "chart.path": "Curbele F = 0 și G = 0 și traseul iterațiilor",
  "chart.systemConvergence": "Convergența: |xₙ − xₙ₋₁| și |yₙ − yₙ₋₁| pe scară logaritmică",
  "chart.fixedPointPath": "Curbele x = F(x, y) și y = G(x, y) și traseul iterațiilor",
  "chart.components": "xₙ, yₙ și zₙ la fiecare iterație",
  "chart.system3Convergence":
    "Convergența: |xₙ − xₙ₋₁|, |yₙ − yₙ₋₁| și |zₙ − zₙ₋₁| pe scară logaritmică",
  "chart.cauchySolution": "Soluția aproximativă în noduri",
  "chart.cauchyError": "Eroarea |y(xᵢ) − yᵢ| în noduri, pe scară logaritmică",
  "chart.toolbar": "Instrumente pentru grafic",
  "chart.tool.zoom": "Mărește o zonă",
  "chart.tool.pan": "Deplasează graficul",
  "chart.tool.zoomIn": "Mărește",
  "chart.tool.zoomOut": "Micșorează",
  "chart.tool.reset": "Revino la vederea inițială",
  "chart.tool.download": "Descarcă ca PNG",
  "chart.trace.f": "f(x)",
  "chart.trace.iterates": "Iterații",
  "chart.trace.tangents": "Tangente",
  "chart.trace.secants": "Secante",
  "chart.trace.steffensenSteps": "Pașii metodei lui Steffensen",
  "chart.trace.halleySteps": "Hiperbole tangente",
  "chart.trace.chebyshevSteps": "Parabole tangente",
  "chart.trace.combinedSteps": "Pașii metodei combinate",
  "chart.trace.phi": "φ(x)",
  "chart.trace.identity": "y = x",
  "chart.trace.path": "Traseul iterațiilor",
  "chart.trace.diff": "|xₙ − xₙ₋₁|",
  "chart.trace.eps": "ε",
  "chart.trace.error": "|xₙ − valoarea exactă|",
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
  "chart.trace.approximation": "Aproximația yᵢ",
  "chart.trace.exactSolution": "Soluția exactă y(x)",
  "chart.trace.nodeError": "|y(xᵢ) − yᵢ|",

  "compare.run": "Compară",
  "compare.method": "Metoda",
  "compare.hint": "Fiecare celulă arată numărul de iterații n și ultima iterație xₙ.",
  "compare.systemHint": "Fiecare celulă arată numărul de iterații n și ultima iterație (xₙ; yₙ).",
  "compare.cell.error": "Eroare",
  "compare.cell.max": "Limită atinsă",
  "compare.inputs": "Date de intrare",
  "compare.precisions": "Precizia",
  "compare.nodesHint":
    "Fiecare rând este un nod xᵢ: valoarea exactă y(xᵢ), apoi, pentru fiecare calcul, yᵢ și, sub ea, eroarea |y(xᵢ) − yᵢ|.",

  "lab1.intro":
    "Rezolvă ecuația f(x) = 0 prin metoda tangentei a lui Newton, calculează rădăcinile de ordinul k folosind aceeași idee și compară rezultatele cu cele obținute prin metoda aproximațiilor succesive.",
  "lab1.method.newton.tab": "1a · Metoda tangentei",
  "lab1.method.newton.title": "Metoda tangentei (Newton)",
  "lab1.method.newton.name": "Metoda tangentei",
  "lab1.method.newton.idea":
    "În vecinătatea lui $x_n$, graficul lui $f$ se înlocuiește cu tangenta în punctul $(x_n, f(x_n))$. Punctul în care tangenta intersectează axa $Ox$ este următoarea iterație:",
  "lab1.method.newton.start":
    "Iterația inițială se alege după regula R0, în funcție de semnul produsului $f(a)\\,f''(a)$. Valoarea $f''(a)$, adică derivata a doua în capătul stâng $a$, se introduce în câmpul dda. Dacă vrei să pornești din alt punct, alege „Introdusă manual” și scrie direct iterația inițială $x_0$.",
  "lab1.method.newton.failure":
    "Dacă $f'(x_n) = 0$, tangenta este orizontală și nu mai intersectează axa $Ox$, așa că metoda se oprește cu eroare.",

  "lab1.method.kthRoot.tab": "1b · Rădăcina de ordinul k",
  "lab1.method.kthRoot.title": "Rădăcina de ordinul k a lui c",
  "lab1.method.kthRoot.name": "Metoda tangentei",
  "lab1.method.kthRoot.idea":
    "Aplicând metoda tangentei funcției $f(x) = x^k - c$, cu $f'(x) = k\\,x^{k-1}$, se obține un șir care folosește doar operații aritmetice:",
  "lab1.method.kthRoot.start": "Iterația inițială: $x_0 = c$ dacă $c > 1$, altfel $x_0 = 1$.",

  "lab1.method.fixedPoint.tab": "1c · Aproximații succesive",
  "lab1.method.fixedPoint.title": "Metoda aproximațiilor succesive",
  "lab1.method.fixedPoint.name": "Aproximații succesive",
  "lab1.method.fixedPoint.idea":
    "Ecuația se scrie sub forma $x = \\varphi(x)$, iar șirul se construiește pornind de la o iterație inițială $x_0$:",
  "lab1.method.fixedPoint.convergence":
    "Șirul converge către punctul fix dacă, în vecinătatea lui, $|\\varphi'(x)| < 1$, iar convergența este cu atât mai rapidă cu cât $|\\varphi'|$ este mai mic. Convergența este liniară, în timp ce metoda tangentei converge pătratic, așa cum arată comparațiile.",

  "lab1.preset.ex1": "Ex. 1: x³ − x − 1 = 0 pe [1; 2]",
  "lab1.preset.ex2R0": "Ex. 2: x⁵ − 5x + 1 = 0, regula R0 pe [−1; 1]",
  "lab1.preset.ex2Manual": "Ex. 2: x⁵ − 5x + 1 = 0, x₀ = 0",
  "lab1.preset.kepler": "Ex. 3: ecuația lui Kepler, x = sin x + 0,25",
  "lab1.preset.sqrt2": "√2",
  "lab1.preset.sqrt3": "√3",
  "lab1.preset.sqrt5": "√5",
  "lab1.preset.cbrt2": "∛2",
  "lab1.preset.cbrt3": "∛3",
  "lab1.preset.cbrtHalf": "∛(1/2)",
  "lab1.preset.keplerFp": "Ex. 3: ecuația lui Kepler, φ(x) = sin x + 0,25",
  "lab1.preset.sqrt2Fp": "√2: φ(x) = (x + 2)/(x + 1)",
  "lab1.preset.sqrt3Fp": "√3: φ(x) = (x + 3)/(x + 1)",
  "lab1.preset.sqrt5Fp": "√5: φ(x) = (x + 5)/(x + 1)",

  "compare.task": "Cerința",
  "lab1.compare.ex1.task":
    "Aproximează rădăcina reală pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹² și urmărește câte iterații sunt necesare în fiecare caz.",
  "lab1.compare.ex2.task":
    "Aproximează rădăcina din intervalul (−1; 1) pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹² și compară numărul de iterații. Pe acest interval regula R0 eșuează (f′(1) = 0), de aceea apare și pornirea din x₀ = 0.",
  "lab1.compare.kepler.task":
    "Pornind din x₀ = 3π/8, cu ε = 10⁻⁴, compară metoda tangentei cu metoda aproximațiilor succesive, φ(x) = sin x + 0,25.",
  "lab1.compare.sqrt.task":
    "Aproximează √2, √3 și √5 prin metoda tangentei și compară rezultatele cu cele obținute prin metoda aproximațiilor succesive. Se folosesc aceleași trei precizii ca la ex. 1–2.",
  "lab1.compare.ex1": "Ex. 1: x³ − x − 1 = 0",
  "lab1.compare.ex2": "Ex. 2: x⁵ − 5x + 1 = 0 pe (−1; 1)",
  "lab1.compare.kepler": "Ex. 3: ecuația lui Kepler, x = sin x + 0,25",
  "lab1.compare.sqrt": "Calculul radicalilor: √2, √3, √5",

  "lab2.intro":
    "Rezolvă ecuația f(x) = 0 fără a folosi derivata: metoda secantei înlocuiește tangenta cu secanta determinată de ultimele două iterații, iar metoda lui Steffensen aproximează derivata doar din valorile lui f. Compară apoi rezultatele și numărul de iterații cu cele obținute prin metoda tangentei.",
  "lab2.method.secant.tab": "2a · Metoda secantei",
  "lab2.method.secant.title": "Metoda secantei",
  "lab2.method.secant.name": "Metoda secantei",
  "lab2.method.secant.idea":
    "Metoda secantei nu folosește derivata: la fiecare pas se calculează o singură valoare nouă a lui $f$, iar convergența este superliniară, de ordin $(1 + \\sqrt{5})/2 \\approx 1{,}618$, deci mai rapidă decât la metoda aproximațiilor succesive, dar mai lentă decât la metoda tangentei. În vecinătatea rădăcinii, graficul lui $f$ se aproximează prin secanta care unește punctele $(x_{n-1}, f(x_{n-1}))$ și $(x_n, f(x_n))$. Următoarea iterație, $x_{n+1}$, este abscisa punctului în care această secantă intersectează axa $Ox$:",
  "lab2.method.secant.start":
    "Metoda pornește din două iterații inițiale: introduci atât $x_0$, cât și $x_1$, iar ele trebuie să fie diferite. Intervalul $[a; b]$ stabilește doar porțiunea afișată pe grafic.",
  "lab2.method.secant.stopping":
    "Criteriul de oprire: $x_0$ și $x_1$ sunt date. Apoi, începând cu $n = 1$, iterațiile continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$, adică până când două iterații consecutive diferă cu mai puțin de $\\varepsilon$. Se afișează $n$ și $x_n$.",
  "lab2.method.secant.failure":
    "Dacă $f(x_n) = 0$, $x_n$ este chiar rădăcina, iar iterațiile rămân în acest punct. Altfel, dacă $f(x_n) = f(x_{n-1})$, secanta este paralelă cu axa $Ox$ și metoda se oprește cu eroare.",

  "lab2.method.steffensen.tab": "2b · Metoda lui Steffensen",
  "lab2.method.steffensen.title": "Metoda lui Steffensen",
  "lab2.method.steffensen.name": "Metoda lui Steffensen",
  "lab2.method.steffensen.idea":
    "Este metoda tangentei fără derivată: $f'(x_n)$ se înlocuiește cu panta secantei prin punctele $(x_n, f(x_n))$ și $(x_n + f(x_n), f(x_n + f(x_n)))$. Fiecare pas folosește două valori ale lui $f$, iar în apropierea rădăcinii metoda converge pătratic, ca metoda tangentei:",
  "lab2.method.steffensen.start":
    "Iterația inițială $x_0$ trebuie aleasă astfel încât $f(x_0)\\,f''(x_0) > 0$. Algoritmul o alege prin regula R0, după semnul produsului $f(a)\\,f''(a)$: valoarea $f''(a)$, adică derivata a doua în capătul stâng $a$, se introduce în câmpul dda sau se calculează din f.",
  "lab2.method.steffensen.failure":
    "Dacă $f(x_n) = 0$, $x_n$ este chiar rădăcina, iar iterațiile rămân în acest punct. Altfel, dacă $f(x_n + f(x_n)) = f(x_n)$, numitorul se anulează și metoda se oprește cu eroare. Funcția $f$ trebuie să fie definită și în punctul auxiliar $x_n + f(x_n)$: o eroare de domeniu sau o depășire poate apărea și acolo, nu doar în $x_n$.",
  "lab2.method.steffensen.chart":
    "Departe de rădăcină, punctul auxiliar $x_n + f(x_n)$ poate ieși mult din intervalul $[a; b]$ (în exemplul numeric, din $x_0 = 2$ se ajunge în 7). Atunci panta este aproximată prost și primii pași sunt lenți, de aceea în exemplul numeric sunt necesare mai multe iterații decât la metoda tangentei. Graficul unește direct punctul $(x_n, f(x_n))$ cu $(x_{n+1}, 0)$.",

  "lab2.preset.ex1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2, x₁ = 1,4",
  "lab2.preset.ex2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2, x₁ = 1,5",
  "lab2.preset.steffensen": "Exemplu numeric: x³ − x − 1 = 0, x₀ = 2",

  "lab2.compare.ex1": "Ex. 1: √2 prin metoda secantei",
  "lab2.compare.ex2": "Ex. 2: x³ − x − 1 = 0 prin metoda secantei",
  "lab2.compare.steffensen": "Exemplu numeric: x³ − x − 1 = 0 prin metoda lui Steffensen",
  "lab2.compare.ex1.task":
    "Aproximează numărul √2 prin metoda secantei și compară rezultatele cu cele obținute prin metoda tangentei. Pentru metoda tangentei, f′ este calculată din f, iar x₀ este dat de regula R0.",
  "lab2.compare.ex2.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda secantei și compară rezultatele cu cele obținute prin metoda tangentei. Pentru metoda tangentei, f′ este calculată din f, iar x₀ este dat de regula R0.",
  "lab2.compare.steffensen.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Steffensen și compară rezultatele cu cele obținute prin metoda tangentei. Pentru metoda tangentei, f′ este calculată din f, iar x₀ este dat de regula R0.",

  "lab3.intro":
    "Rezolvă ecuația f(x) = 0 prin metoda lui Halley și prin metoda lui Cebîșev, două generalizări ale metodei tangentei care folosesc și derivata a doua. Compară apoi rezultatele și numărul de iterații cu cele obținute prin metoda tangentei.",
  "lab3.method.halley.tab": "3a · Metoda lui Halley",
  "lab3.method.halley.title": "Metoda lui Halley",
  "lab3.method.halley.name": "Metoda lui Halley",
  "lab3.method.halley.idea":
    "Ca la metoda tangentei, în vecinătatea lui $x_n$ graficul lui $f$ se înlocuiește cu o curbă simplă, iar $x_{n+1}$ este abscisa punctului în care aceasta intersectează axa $Ox$. Metoda lui Halley folosește hiperbola tangentă, care are în $x_n$ aceeași valoare și aceeași pantă ca $f$, dar și aceeași curbură. De aceea, în apropierea unei rădăcini simple, convergența este cubică, nu pătratică:",
  "lab3.method.halley.start":
    "Iterația inițială $x_0$ trebuie să verifice $f(x_0)\\,f''(x_0) > 0$. Cu „Regula R0”, algoritmul o alege singur dintre capetele $a$ și $b$; cu „Introdusă manual”, o scrii direct.",
  "lab3.method.halley.failure":
    "Dacă $f(x_n) = 0$, $x_n$ este chiar rădăcina, iar iterațiile rămân în acest punct. Altfel, dacă $2f'(x_n)^2 - f(x_n)\\,f''(x_n) = 0$, numitorul se anulează și metoda se oprește cu eroare. Dacă $f'(x_n) = 0$, dar $f(x_n) \\ne 0$, pasul ar lăsa $x_n$ neschimbat fără să ajungă la rădăcină, așa că metoda se oprește tot cu eroare.",
  "lab3.method.halley.chart":
    "Graficul urmărește fiecare pas pe hiperbola tangentă, de la $(x_n, f(x_n))$ la $(x_{n+1}, 0)$. Când $2f'(x_n)^2 - f(x_n)\\,f''(x_n) < 0$, asimptota verticală a hiperbolei se află între aceste două puncte, așa că pasul respectiv este desenat ca un segment de dreaptă.",
  "lab3.method.halley.error.zero-denominator":
    "Numitorul 2f′(xₙ)² − f(xₙ)f″(xₙ) se anulează la n = {n}, în xₙ = {x}, deci xₙ₊₁ nu poate fi calculat.",

  "lab3.method.chebyshev.tab": "3b · Metoda lui Cebîșev",
  "lab3.method.chebyshev.title": "Metoda lui Cebîșev",
  "lab3.method.chebyshev.name": "Metoda lui Cebîșev",
  "lab3.method.chebyshev.idea":
    "Ca la metoda tangentei, în vecinătatea lui $x_n$ graficul lui $f$ se înlocuiește cu o curbă simplă, iar $x_{n+1}$ este abscisa punctului în care aceasta intersectează axa $Ox$. Metoda lui Cebîșev folosește parabola tangentă, cu axa paralelă cu $Ox$, care are în $x_n$ aceeași valoare, aceeași pantă și aceeași curbură ca $f$. Convergența este tot cubică, ca la metoda lui Halley:",
  "lab3.method.chebyshev.start":
    "Iterația inițială $x_0$ trebuie aleasă astfel încât $f(x_0)\\,f''(x_0) > 0$ și se introduce direct: acest algoritm nu folosește regula R0. Intervalul $[a; b]$ stabilește doar porțiunea afișată pe grafic.",
  "lab3.method.chebyshev.failure":
    "Dacă $f(x_n) = 0$, $x_n$ este chiar rădăcina, iar iterațiile rămân în acest punct. Altfel, dacă $f'(x_n) = 0$, ambele fracții au numitorul zero și metoda se oprește cu eroare.",
  "lab3.method.chebyshev.chart":
    "Graficul urmărește fiecare pas pe parabola tangentă, de la $(x_n, f(x_n))$ la $(x_{n+1}, 0)$.",

  "lab3.preset.ex1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
  "lab3.preset.ex2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2",
  "lab3.preset.chebyshev": "Exemplu numeric: x³ − x − 1 = 0, x₀ = 2",

  "lab3.compare.ex1": "Ex. 1: √2 prin metoda lui Halley",
  "lab3.compare.ex2": "Ex. 2: x³ − x − 1 = 0 prin metoda lui Halley",
  "lab3.compare.chebyshev": "Exemplu numeric: x³ − x − 1 = 0 prin metoda lui Cebîșev",
  "lab3.compare.ex1.task":
    "Aproximează numărul √2 prin metoda lui Halley și compară rezultatele cu cele obținute prin metoda tangentei.",
  "lab3.compare.ex2.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Halley și compară rezultatele cu cele obținute prin metoda tangentei.",
  "lab3.compare.chebyshev.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Cebîșev și compară rezultatele cu cele obținute prin metoda tangentei.",

  "lab4.intro":
    "Rezolvă ecuația f(x) = 0 prin metoda combinată a tangentei, care adaugă fiecărui pas al metodei tangentei un al doilea pas cu aceeași pantă, și calculează radicalii cu o metodă de ordinul 3. Compară apoi rezultatele și numărul de iterații cu cele obținute prin metoda tangentei.",
  "lab4.method.combinedTangent.tab": "4a · Metoda combinată a tangentei",
  "lab4.method.combinedTangent.title": "Metoda combinată a tangentei",
  "lab4.method.combinedTangent.name": "Metoda combinată a tangentei",
  "lab4.method.combinedTangent.idea":
    "Fiecare pas are două etape cu aceeași pantă $f'(x_n)$. Prima este un pas al metodei tangentei, până în punctul $y_n = x_n - f(x_n)/f'(x_n)$. A doua pornește din $(y_n, f(y_n))$ pe o dreaptă paralelă cu tangenta și intersectează axa $Ox$ în $x_{n+1}$. Derivata se calculează o singură dată la fiecare pas, iar în apropierea unei rădăcini simple convergența este cubică:",
  "lab4.method.combinedTangent.start":
    "Iterația inițială $x_0$ trebuie aleasă astfel încât $f(x_0)\\,f''(x_0) > 0$ și se introduce direct: acest algoritm nu folosește regula R0. Intervalul $[a; b]$ stabilește doar porțiunea afișată pe grafic.",
  "lab4.method.combinedTangent.failure":
    "Dacă $f(x_n) = 0$, $x_n$ este chiar rădăcina, iar iterațiile rămân în acest punct. Altfel, dacă $f'(x_n) = 0$, tangenta este orizontală și metoda se oprește cu eroare. Funcția $f$ trebuie să fie definită și în punctul auxiliar $y_n$: o eroare de domeniu sau o depășire poate apărea și acolo, nu doar în $x_n$.",
  "lab4.method.combinedTangent.chart":
    "Graficul arată ambele etape ale fiecărui pas: tangenta de la $(x_n, f(x_n))$ la $(y_n, 0)$, o linie punctată până la $(y_n, f(y_n))$ și paralela de acolo până la $(x_{n+1}, 0)$.",

  "lab4.method.thirdOrderRoot.tab": "4b · Calculul radicalilor",
  "lab4.method.thirdOrderRoot.title": "Calculul radicalilor cu metoda de ordinul 3",
  "lab4.method.thirdOrderRoot.name": "Metoda de ordinul 3",
  "lab4.method.thirdOrderRoot.idea":
    "Pentru a aproxima $\\sqrt{a}$, cu $a > 0$, se construiește șirul de mai jos, care folosește doar operații aritmetice. Este metoda lui Halley aplicată funcției $f(x) = x^2 - a$, de aceea converge cubic în apropierea lui $\\sqrt{a}$:",
  "lab4.method.thirdOrderRoot.start": "Iterația inițială: $x_0 = a$.",
  "lab4.method.thirdOrderRoot.chart":
    "Graficul arată funcția $f(x) = x^2 - a$ și urmărește fiecare pas pe hiperbola tangentă a metodei lui Halley, de la $(x_n, x_n^2 - a)$ la $(x_{n+1}, 0)$.",

  "lab4.preset.combinedEx1": "Ex. 1: √2, f(x) = x² − 2, x₀ = 2",
  "lab4.preset.combinedEx2": "Ex. 2: x³ − x − 1 = 0, x₀ = 2",
  "lab4.preset.rootEx1": "Ex. 1: √2, a = 2",
  "lab4.preset.rootEx2Sqrt3": "Ex. 2: √3, a = 3",
  "lab4.preset.rootEx2Sqrt5": "Ex. 2: √5, a = 5",

  "lab4.compare.combinedEx1": "Ex. 1: √2 prin metoda combinată a tangentei",
  "lab4.compare.combinedEx2": "Ex. 2: x³ − x − 1 = 0 prin metoda combinată a tangentei",
  "lab4.compare.rootEx1": "Ex. 1: √2 prin metoda de ordinul 3",
  "lab4.compare.rootEx2": "Ex. 2: √3 și √5 prin metoda de ordinul 3",
  "lab4.compare.combinedEx1.task":
    "Aproximează numărul √2 prin metoda combinată a tangentei și compară rezultatele cu cele furnizate de metoda tangentei.",
  "lab4.compare.combinedEx2.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda combinată a tangentei și compară rezultatele cu cele furnizate de metoda tangentei.",
  "lab4.compare.rootEx1.task":
    "Aproximează √2 prin metoda de ordinul 3 și compară rezultatele cu cele furnizate de metoda iterativă adaptată în urma folosirii metodei tangentei.",
  "lab4.compare.rootEx2.task":
    "Aproximează √3 și √5 prin metoda de ordinul 3 și compară rezultatele cu cele furnizate de metoda iterativă adaptată în urma folosirii metodei tangentei. Metoda converge către √a, deci se ia a = 3, respectiv a = 5.",

  "lab5.intro":
    "Rezolvă sistemul neliniar F(x, y) = 0, G(x, y) = 0 prin metoda lui Newton, care liniarizează ambele ecuații la fiecare pas, și prin metoda lui Newton modificată, care păstrează derivatele parțiale din punctul inițial. Compară apoi rezultatele și numărul de iterații obținute prin cele două metode.",
  "lab5.method.newton.tab": "5a · Metoda lui Newton",
  "lab5.method.newton.title": "Metoda lui Newton pentru sisteme neliniare",
  "lab5.method.newton.name": "Metoda lui Newton",
  "lab5.method.newton.idea":
    "În jurul punctului $(x_n; y_n)$, fiecare dintre funcțiile $F$ și $G$ se aproximează prin planul său tangent. Următoarea iterație $(x_{n+1}; y_{n+1})$ este punctul în care ambele plane tangente se anulează, adică soluția unui sistem liniar 2×2. Rezolvând acest sistem cu regula lui Cramer, se obțin formulele de mai jos, în care $F$, $G$ și derivatele parțiale $F_x = \\partial F/\\partial x$, $F_y$, $G_x$, $G_y$ se calculează în $(x_n; y_n)$, iar $J$ este jacobianul:",
  "lab5.method.newton.start":
    "Punctul inițial $(x_0; y_0)$ trebuie ales suficient de aproape de soluție, altfel metoda poate să nu conveargă. În apropierea unei soluții simple, convergența este pătratică: la fiecare pas, numărul de zecimale exacte aproape se dublează.",
  "lab5.method.newton.failure":
    "Dacă jacobianul se anulează într-o iterație, sistemul liniar nu mai are soluție unică, pasul următor nu poate fi calculat și metoda se oprește cu eroare. Excepție face cazul în care $F$ și $G$ sunt exact zero în $(x_n; y_n)$: punctul este deja soluția, iar iterațiile rămân în el.",
  "lab5.method.newton.chart":
    "Primul grafic desenează curbele $F(x, y) = 0$ și $G(x, y) = 0$. Soluția sistemului este punctul în care ele se intersectează, iar traseul iterațiilor arată cum se apropie metoda de acest punct. Al doilea grafic arată, pe scară logaritmică, cum scad de la un pas la altul diferențele $|x_n - x_{n-1}|$ și $|y_n - y_{n-1}|$ până sub $\\varepsilon$.",

  "lab5.method.modified.tab": "5b · Newton modificată",
  "lab5.method.modified.title": "Metoda lui Newton modificată",
  "lab5.method.modified.name": "Metoda lui Newton modificată",
  "lab5.method.modified.idea":
    "Metoda folosește aceleași formule ca metoda lui Newton, cu o singură diferență: derivatele parțiale, și odată cu ele jacobianul, se calculează o singură dată, în punctul inițial ($F_x^0 = F_x(x_0, y_0)$ și analog pentru celelalte). La fiecare pas se recalculează doar $F$ și $G$ în $(x_n; y_n)$:",
  "lab5.method.modified.start":
    "Astfel, un pas costă mai puțin, dar convergența devine liniară și sunt necesare mai multe iterații decât la metoda lui Newton. Punctul inițial $(x_0; y_0)$ contează aici de două ori: trebuie să fie suficient de aproape de soluție și tot din el provin derivatele folosite pe parcursul întregului calcul.",
  "lab5.method.modified.failure":
    "Cum $J_0$ nu se schimbă de la un pas la altul, un jacobian nul în punctul inițial oprește metoda cu eroare chiar de la primul pas. Excepție face cazul în care $F$ și $G$ sunt exact zero într-o iterație $(x_n; y_n)$: punctul este deja soluția, iar iterațiile rămân în el.",
  "lab5.method.modified.chart":
    "Primul grafic desenează curbele $F(x, y) = 0$ și $G(x, y) = 0$. Soluția sistemului este punctul în care ele se intersectează, iar traseul iterațiilor arată cum se apropie metoda de acest punct. Al doilea grafic arată, pe scară logaritmică, cum scad de la un pas la altul diferențele $|x_n - x_{n-1}|$ și $|y_n - y_{n-1}|$ până sub $\\varepsilon$.",

  "lab5.preset.ex1": "Ex. 1: 2x³ − y² − 1 = 0, xy³ − y − 4 = 0, din (1,2; 1,7)",
  "lab5.preset.ex2First": "Ex. 2: x² + y² = 10, √(x + y) = 2, din (0,9; 3,1)",
  "lab5.preset.ex2Second": "Ex. 2: x² + y² = 10, √(x + y) = 2, din (2,9; 1,1)",
  "lab5.preset.ex3First": "Ex. 3: x² + y² = 10, √(x + y) = 2, din (0,9; 3,1)",
  "lab5.preset.ex3Second": "Ex. 3: x² + y² = 10, √(x + y) = 2, din (2,9; 1,1)",

  "lab5.compare.ex3": "Ex. 3: metoda lui Newton modificată pentru x² + y² = 10, √(x + y) = 2",
  "lab5.compare.ex3.task":
    "Aplică metoda lui Newton modificată sistemului x² + y² = 10, √(x + y) = 2 și compară rezultatul și numărul de iterații cu cele obținute prin metoda lui Newton. Se pornește din (0,9; 3,1) și din (2,9; 1,1), fiecare cu cele trei precizii.",

  "lab6.intro":
    "Rezolvă sisteme neliniare scrise sub forma x = F(x, y), y = G(x, y) prin metoda aproximațiilor succesive și prin metoda Gauss–Seidel, care folosește fiecare coordonată nouă imediat ce a fost calculată, pentru sisteme cu trei și cu două ecuații. Compară apoi numărul de iterații necesar celor două metode.",
  "lab6.method.successive.tab": "6a · Aproximații succesive",
  "lab6.method.successive.title": "Metoda aproximațiilor succesive pentru sisteme neliniare",
  "lab6.method.successive.name": "Metoda aproximațiilor succesive",
  "lab6.method.successive.idea":
    "Sistemul se rescrie mai întâi sub forma $x = F(x, y)$, $y = G(x, y)$, astfel încât soluția lui este un punct pe care $F$ și $G$ îl lasă neschimbat. Pornind din $(x_0; y_0)$, la fiecare pas ambele funcții se calculează în punctul curent:",
  "lab6.method.successive.start":
    "Primul pas, $(x_1; y_1) = (F(x_0, y_0); G(x_0, y_0))$, folosește doar punctul inițial. Metoda converge dacă, într-o vecinătate a soluției care conține $(x_0; y_0)$, aplicația $(x; y) \\mapsto (F(x, y); G(x, y))$ este o contracție, cu o constantă $M < 1$. Convergența este liniară: la fiecare pas eroarea scade de aproximativ $M$ ori, deci cu cât $M$ este mai mic, cu atât sunt necesare mai puține iterații.",
  "lab6.method.successive.failure":
    "Dacă $F$ sau $G$ nu este definită într-o iterație, de pildă din cauza unui radical dintr-un număr negativ, metoda se oprește cu eroare. Dacă aplicația nu este o contracție în jurul soluției, iterațiile se pot îndepărta de ea, iar când o coordonată depășește $10^{100}$ metoda se oprește: șirul iterațiilor diverge.",
  "lab6.method.successive.chart":
    "Primul grafic desenează curbele $x = F(x, y)$ și $y = G(x, y)$. Soluția sistemului este punctul în care ele se intersectează, iar traseul iterațiilor arată cum se apropie metoda de acest punct. Al doilea grafic arată, pe scară logaritmică, cum scad de la un pas la altul diferențele $|x_n - x_{n-1}|$ și $|y_n - y_{n-1}|$ până sub $\\varepsilon$.",

  "lab6.method.gaussSeidel3.tab": "6b · Gauss–Seidel, 3 ecuații",
  "lab6.method.gaussSeidel3.title": "Metoda Gauss–Seidel pentru sisteme cu trei ecuații",
  "lab6.method.gaussSeidel3.name": "Metoda Gauss–Seidel, 3 ecuații",
  "lab6.method.gaussSeidel3.idea":
    "Sistemul se scrie sub forma $x = F_1(x, y, z)$, $y = F_2(x, y, z)$, $z = F_3(x, y, z)$. Metoda Gauss–Seidel lucrează ca metoda aproximațiilor succesive, cu o singură diferență: fiecare coordonată nouă este folosită imediat ce a fost calculată. Astfel, $y_{n+1}$ se calculează deja cu $x_{n+1}$, iar $z_{n+1}$ cu $x_{n+1}$ și $y_{n+1}$:",
  "lab6.method.gaussSeidel3.start":
    "Primul pas folosește doar punctul inițial: $x_1$, $y_1$ și $z_1$ sunt valorile lui $F_1$, $F_2$ și $F_3$ în $(x_0; y_0; z_0)$. Începând cu $n = 1$, se aplică formulele de mai sus. Ca la metoda aproximațiilor succesive, metoda converge dacă aplicația este o contracție în jurul soluției și punctul inițial este suficient de aproape de ea, iar convergența este liniară. Folosirea celor mai noi valori economisește de obicei iterații.",
  "lab6.method.gaussSeidel3.failure":
    "Dacă $F_1$, $F_2$ sau $F_3$ nu este definită într-o iterație, de pildă din cauza unui radical dintr-un număr negativ sau a unui logaritm dintr-un număr nepozitiv, metoda se oprește cu eroare. Dacă iterațiile se îndepărtează de soluție și o coordonată depășește $10^{100}$, metoda se oprește: șirul iterațiilor diverge.",
  "lab6.method.gaussSeidel3.chart":
    "Cu trei necunoscute, traseul iterațiilor nu mai încape într-un plan, așa că primul grafic urmărește de la un pas la altul cum se stabilizează $x_n$, $y_n$ și $z_n$ în jurul soluției. Al doilea grafic arată, pe scară logaritmică, cum scad cele trei diferențe până când toate ajung sub $\\varepsilon$.",

  "lab6.method.gaussSeidel2.tab": "6c · Gauss–Seidel, 2 ecuații",
  "lab6.method.gaussSeidel2.title": "Metoda Gauss–Seidel pentru sisteme cu două ecuații",
  "lab6.method.gaussSeidel2.name": "Metoda Gauss–Seidel",
  "lab6.method.gaussSeidel2.idea":
    "Sistemul se scrie sub forma $x = F(x, y)$, $y = G(x, y)$, ca la metoda aproximațiilor succesive, cu o singură diferență: $y_{n+1}$ se calculează cu noul $x_{n+1}$, nu cu $x_n$. Cea mai nouă valoare este folosită imediat:",
  "lab6.method.gaussSeidel2.start":
    "Primul pas folosește doar punctul inițial, $(x_1; y_1) = (F(x_0, y_0); G(x_0, y_0))$, ca la metoda aproximațiilor succesive. Începând cu $n = 1$, se aplică formulele de mai sus. Metoda converge în aceleași condiții de contracție în jurul soluției, iar convergența rămâne liniară, dar de obicei cu un factor mai mic, deci sunt necesare mai puține iterații.",
  "lab6.method.gaussSeidel2.failure":
    "Dacă $F$ sau $G$ nu este definită într-o iterație, de pildă din cauza unui radical dintr-un număr negativ, metoda se oprește cu eroare. Dacă iterațiile se îndepărtează de soluție și o coordonată depășește $10^{100}$, metoda se oprește: șirul iterațiilor diverge.",
  "lab6.method.gaussSeidel2.chart":
    "Primul grafic desenează curbele $x = F(x, y)$ și $y = G(x, y)$. Soluția sistemului este punctul în care ele se intersectează, iar traseul iterațiilor arată cum se apropie metoda de acest punct. Al doilea grafic arată, pe scară logaritmică, cum scad de la un pas la altul diferențele $|x_n - x_{n-1}|$ și $|y_n - y_{n-1}|$ până sub $\\varepsilon$.",

  "lab6.preset.ex1": "Ex. 1: 2x² − xy − 5x + 1 = 0, x + 3 lg x − y² = 0, din (3,5; 2,2)",
  "lab6.preset.ex2Near21": "Ex. 2: x² + y² = 5, xy = 2, în jurul lui (2; 1)",
  "lab6.preset.ex2Near12": "Ex. 2: x² + y² = 5, xy = 2, în jurul lui (1; 2)",
  "lab6.preset.ex2NearMinus1Minus2": "Ex. 2: x² + y² = 5, xy = 2, în jurul lui (−1; −2)",
  "lab6.preset.ex2NearMinus2Minus1": "Ex. 2: x² + y² = 5, xy = 2, în jurul lui (−2; −1)",
  "lab6.preset.ex3":
    "Ex. 3: 2x² − yz − 5x + 1 = 0, y² − 2x − ln z = 0, z² − xy − 2z − 8 = 0, din (10; 10; 10)",
  "lab6.preset.ex4": "Ex. 4: x² + y² = 5, xy = 2, în jurul lui (2; 1)",

  "lab6.compare.ex4": "Ex. 4: metoda Gauss–Seidel pentru x² + y² = 5, xy = 2",
  "lab6.compare.ex4.task":
    "Aplică metoda Gauss–Seidel sistemului x² + y² = 5, xy = 2, în jurul lui (2; 1), pornind din (1,5; 1,5), și compară numărul de iterații cu cel obținut prin metoda aproximațiilor succesive. Ambele metode se aplică cu cele trei precizii.",

  "lab7.intro":
    "Rezolvă problema Cauchy y′ = f(x, y), y(x₀) = y₀ pas cu pas, în noduri echidistante, prin metoda lui Euler, metoda modificată a lui Euler (metoda mid-point) și metoda Euler–Heun. Compară apoi aproximațiile cu soluția exactă, nod cu nod.",
  "lab7.method.euler.tab": "7a · Euler",
  "lab7.method.euler.title": "Metoda lui Euler",
  "lab7.method.euler.name": "Metoda lui Euler",
  "lab7.method.euler.idea":
    "Din nodul $(x_{i-1}; y_{i-1})$, soluția este urmărită de-a lungul tangentei. Panta ei în acest punct este $f(x_{i-1}, y_{i-1})$, iar un pas de lungime $h$ pe tangentă dă $y_i$:",
  "lab7.method.euler.steps":
    "Intervalul $[x_0; x_0 + T]$ se împarte în $n$ pași egali, iar formula se aplică pentru $i = 1, \\dots, n$, pornind de la $y_0 = y(x_0)$. Se afișează $y_1, \\dots, y_n$, aproximațiile valorilor $y(x_1), \\dots, y(x_n)$. Un pas costă o singură valoare a lui $f$, iar metoda este de ordinul întâi: dacă pasul $h$ se înjumătățește, eroarea într-un punct $x$ dat scade cam la jumătate.",
  "lab7.method.euler.failure":
    "Dacă $f$ nu este definită într-un nod, de pildă din cauza unui radical dintr-un număr negativ, metoda se oprește cu eroare și păstrează nodurile calculate până atunci. Dacă $|y_i|$ depășește $10^{100}$, aproximațiile cresc nemărginit, iar metoda se oprește de asemenea.",
  "lab7.method.euler.chart":
    "Primul grafic arată valorile $y_i$ calculate în fiecare nod. Dacă introduci soluția exactă $y(x)$, ea apare pe același grafic, ca să vezi cât de aproape sunt punctele de curbă. Tot atunci apare un al doilea grafic, cu eroarea $|y(x_i) - y_i|$ din fiecare nod. Axa lui verticală este pe scară logaritmică, ca să se vadă și erorile foarte mici.",
  "lab7.method.modified.tab": "7b · Euler modificată",
  "lab7.method.modified.title": "Metoda modificată a lui Euler (metoda mid-point)",
  "lab7.method.modified.name": "Metoda modificată a lui Euler",
  "lab7.method.modified.idea":
    "Metoda lui Euler folosește doar panta de la începutul pasului. Metoda modificată face mai întâi o jumătate de pas pe această pantă, până la mijlocul $x_{i-1} + h/2$, apoi folosește panta $U$ găsită acolo pentru întregul pas:",
  "lab7.method.modified.steps":
    "Ca la metoda lui Euler, intervalul $[x_0; x_0 + T]$ se împarte în $n$ pași egali, iar pasul se aplică pentru $i = 1, \\dots, n$, pornind de la $y_0 = y(x_0)$. Un pas costă două valori ale lui $f$, iar metoda este de ordinul doi: dacă pasul $h$ se înjumătățește, eroarea scade de aproximativ patru ori.",
  "lab7.method.modified.failure":
    "Dacă $f$ nu este definită într-un nod sau în punctul de mijloc $(x_{i-1} + h/2; y_{i-1} + (h/2)K)$, de pildă din cauza unui radical dintr-un număr negativ, metoda se oprește cu eroare și păstrează nodurile calculate până atunci. Dacă $|y_i|$ depășește $10^{100}$, aproximațiile cresc nemărginit, iar metoda se oprește de asemenea.",
  "lab7.method.modified.chart":
    "Primul grafic arată valorile $y_i$ calculate în fiecare nod. Dacă introduci soluția exactă $y(x)$, ea apare pe același grafic, ca să vezi cât de aproape sunt punctele de curbă. Tot atunci apare un al doilea grafic, cu eroarea $|y(x_i) - y_i|$ din fiecare nod. Axa lui verticală este pe scară logaritmică, ca să se vadă și erorile foarte mici.",
  "lab7.method.heun.tab": "7c · Euler–Heun",
  "lab7.method.heun.title": "Metoda Euler–Heun",
  "lab7.method.heun.name": "Metoda Euler–Heun",
  "lab7.method.heun.idea":
    "Un pas Euler estimează mai întâi valoarea de la capătul pasului, iar acolo se calculează panta $K_2$. Pasul folosește apoi media celor două pante, $K_1$ la început și $K_2$ la sfârșit, ca în formula trapezelor:",
  "lab7.method.heun.steps":
    "Ca la metoda lui Euler, intervalul $[x_0; x_0 + T]$ se împarte în $n$ pași egali, iar pasul se aplică pentru $i = 1, \\dots, n$, pornind de la $y_0 = y(x_0)$. Un pas costă două valori ale lui $f$, iar metoda este de ordinul doi: dacă pasul $h$ se înjumătățește, eroarea scade de aproximativ patru ori.",
  "lab7.method.heun.failure":
    "Dacă $f$ nu este definită într-un nod sau în punctul estimat $(x_{i-1} + h; y_{i-1} + hK_1)$, de pildă din cauza unui radical dintr-un număr negativ, metoda se oprește cu eroare și păstrează nodurile calculate până atunci. Dacă $|y_i|$ depășește $10^{100}$, aproximațiile cresc nemărginit, iar metoda se oprește de asemenea.",
  "lab7.method.heun.chart":
    "Primul grafic arată valorile $y_i$ calculate în fiecare nod. Dacă introduci soluția exactă $y(x)$, ea apare pe același grafic, ca să vezi cât de aproape sunt punctele de curbă. Tot atunci apare un al doilea grafic, cu eroarea $|y(x_i) - y_i|$ din fiecare nod. Axa lui verticală este pe scară logaritmică, ca să se vadă și erorile foarte mici.",
  "lab7.preset.ex1H4": "Ex. 1: y′ = x² − y, h = 1/4",
  "lab7.preset.ex1H8": "Ex. 1: y′ = x² − y, h = 1/8",
  "lab7.preset.ex1H16": "Ex. 1: y′ = x² − y, h = 1/16",
  "lab7.preset.ex2": "Ex. 2: y′ = y + x, h = 0,1",
  "lab7.preset.exampleModified": "Exemplu numeric: y′ = y + x, h = 0,1",
  "lab7.preset.exampleHeun": "Exemplu numeric: y′ = y + x, h = 0,1",
  "lab7.compare.ex1": "Ex. 1: y′ = x² − y cu h = 1/4, 1/8 și 1/16",
  "lab7.compare.ex1.task":
    "Rezolvă problema y′ = x² − y, y(0) = 1 pe [0; 4] prin metoda lui Euler, cu h = 1/4, 1/8 și 1/16, și afișează în fiecare nod valoarea exactă y = x² − 2x + 2 − e⁻ˣ, aproximația și eroarea. Tabelul cuprinde nodurile comune celor trei pași, x = 0,25; 0,5; …; 4.",
  "lab7.compare.example":
    "Exemplu numeric: metoda lui Euler, metoda modificată și metoda Euler–Heun pentru y′ = y + x",
  "lab7.compare.example.task":
    "Rezolvă problema y′ = y + x, y(0) = 1 pe [0; 1], cu h = 0,1, prin metoda lui Euler, metoda modificată a lui Euler și metoda Euler–Heun și compară, în fiecare nod, cele trei aproximații cu soluția exactă y = 2eˣ − x − 1.",
  "lab7.compare.example.note":
    "Coloanele metodei modificate și ale metodei Euler–Heun coincid, așa cum e de așteptat: pentru un f liniar, cum este y + x, ambele metode înmulțesc la fiecare pas y + x + 1 cu 1 + h + h²/2, deci dau aceleași valori yᵢ.",
};
