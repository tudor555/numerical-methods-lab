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
  "lab4.topic": "Metoda tangentei combinate și o rădăcină pătrată de ordinul trei",
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
    "Criteriul de oprire: $x_1$ se calculează separat din $x_0$, apoi, pornind de la $n = 1$, calculul continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$. Se afișează $n$ și $x_n$.",

  "math.if": "dacă",

  "form.run": "Calculează",
  "form.blocked": "Corectează câmpurile marcate ca să poți calcula.",
  "form.derive": "Calculează din f",
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

  "run.error.zero-derivative":
    "Derivata se anulează la n = {n}, în xₙ = {x}: tangenta este orizontală, deci xₙ₊₁ nu poate fi calculat.",
  "run.error.zero-denominator":
    "Numitorul se anulează la n = {n}, în xₙ = {x}: f ia aceeași valoare în ambele puncte, deci xₙ₊₁ nu poate fi calculat.",
  "run.error.undefined-value":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare nu este definită (NaN). Verifică domeniul de definiție al funcțiilor (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.error.overflow":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare a devenit infinită (±∞).",
  "run.error.diverged": "Șirul iterațiilor diverge: |xₙ| a depășit 10¹⁰⁰ la n = {n} (xₙ = {x}).",

  "table.title": "Tabelul iterațiilor",
  "table.hidden": "Iterații ascunse: {count}",
  "table.showAll": "Arată toate",

  "chart.tangent": "Graficul lui f și tangentele succesive",
  "chart.secant": "Graficul lui f și secantele succesive",
  "chart.steffensen": "Graficul lui f și pașii metodei lui Steffensen",
  "chart.halley": "Graficul lui f și hiperbolele tangente",
  "chart.chebyshev": "Graficul lui f și parabolele tangente",
  "chart.cobweb": "Graficul lui φ, dreapta y = x și traseul iterațiilor",
  "chart.convergence": "Convergența: |xₙ − xₙ₋₁| pe scară logaritmică",
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
  "chart.trace.phi": "φ(x)",
  "chart.trace.identity": "y = x",
  "chart.trace.path": "Traseul iterațiilor",
  "chart.trace.diff": "|xₙ − xₙ₋₁|",
  "chart.trace.eps": "ε",
  "chart.trace.error": "|xₙ − valoarea exactă|",

  "compare.run": "Compară",
  "compare.method": "Metoda",
  "compare.hint": "Fiecare celulă arată numărul de iterații n și ultima iterație xₙ.",
  "compare.cell.error": "Eroare",
  "compare.cell.max": "Limită atinsă",

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
  "lab1.preset.cbrt12": "∛12",
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
  "lab1.compare.sqrt": "Ex. 4: √2, √3, √5",

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
    "Criteriul de oprire: $x_1$ este dat, așa că, pornind de la $n = 1$, calculul continuă cât timp $|x_n - x_{n-1}| \\ge \\varepsilon$. Se afișează $n$ și $x_n$.",
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
    "Aproximează numărul √2 prin metoda secantei, folosind f(x) = x² − 2, intervalul [1; 2] și valorile inițiale x₀ = 2 și x₁ = 1,4, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Metoda tangentei folosește aceeași funcție și același interval, cu derivata calculată din f și iterația inițială x₀ = 2, dată de regula R0.",
  "lab2.compare.ex2.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda secantei, cu intervalul [1; 2] și valorile inițiale x₀ = 2 și x₁ = 1,5, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Metoda tangentei folosește aceeași funcție și același interval, cu derivata calculată din f și iterația inițială x₀ = 2, dată de regula R0.",
  "lab2.compare.steffensen.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Steffensen, cu intervalul [1; 2] și valoarea inițială x₀ = 2, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Ambele metode pornesc din x₀ = 2, dată de regula R0, iar metoda tangentei folosește derivata calculată din f.",

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
    "Aproximează numărul √2 prin metoda lui Halley, folosind f(x) = x² − 2, f′(x) = 2x și f″(x) = 2, intervalul [1; 2] și iterația inițială x₀ = 2, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Metoda tangentei folosește aceeași funcție, derivata f′(x) = 2x și iterația inițială x₀ = 2.",
  "lab3.compare.ex2.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Halley, folosind f′(x) = 3x² − 1 și f″(x) = 6x, intervalul [1; 2] și iterația inițială x₀ = 2, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Metoda tangentei folosește aceeași funcție, derivata f′(x) = 3x² − 1 și iterația inițială x₀ = 2.",
  "lab3.compare.chebyshev.task":
    "Aproximează rădăcina reală a ecuației x³ − x − 1 = 0 prin metoda lui Cebîșev, folosind f′(x) = 3x² − 1 și f″(x) = 6x, intervalul [1; 2] și iterația inițială x₀ = 2, pentru ε = 10⁻⁴, 10⁻⁸ și 10⁻¹², și compară rezultatele cu cele obținute prin metoda tangentei. Metoda tangentei folosește aceeași funcție, derivata f′(x) = 3x² − 1 și iterația inițială x₀ = 2.",
};
