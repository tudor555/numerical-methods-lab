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
  "lab3.title": "Metodele lui Halley și Cebâșev",
  "lab3.topic": "Metode de ordinul trei care folosesc și f″",
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
  "field.x0": "Iterația inițială",
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
  "field.error.integer-min": "Valoarea trebuie să fie un număr întreg, cel puțin {min}.",
  "field.error.integer-range": "Valoarea trebuie să fie un număr întreg între {min} și {max}.",
  "field.error.greater-than": "Valoarea trebuie să fie mai mare decât {other}.",
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
  "run.error.undefined-value":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare nu este definită (NaN). Verifică domeniul de definiție al funcțiilor (radical dintr-un număr negativ, logaritm dintr-un număr nepozitiv).",
  "run.error.overflow":
    "La pasul care pornește din n = {n}, xₙ = {x}, o valoare a devenit infinită (±∞).",
  "run.error.diverged": "Șirul iterațiilor diverge: |xₙ| a depășit 10¹⁰⁰ la n = {n} (xₙ = {x}).",

  "table.title": "Tabelul iterațiilor",
  "table.hidden": "Iterații ascunse: {count}",
  "table.showAll": "Arată toate",

  "chart.tangent": "Graficul lui f și tangentele succesive",
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
    "Aproximează √2, √3 și √5 prin metoda tangentei și compară rezultatele cu cele obținute prin metoda aproximațiilor succesive. Laboratorul nu indică ε, așa că se folosesc cele trei precizii de la ex. 1–2.",
  "lab1.compare.ex1": "Ex. 1: x³ − x − 1 = 0",
  "lab1.compare.ex2": "Ex. 2: x⁵ − 5x + 1 = 0 pe (−1; 1)",
  "lab1.compare.kepler": "Ex. 3: ecuația lui Kepler, x = sin x + 0,25",
  "lab1.compare.sqrt": "Ex. 4: √2, √3, √5",
};
