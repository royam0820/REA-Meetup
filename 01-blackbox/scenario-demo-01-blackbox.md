---
title: "Démo 1 — La Boîte Noire (01-blackbox)"
tags:
  - rea
  - demo
  - reverse-engineering
  - ghidra
---

# Démo 1 — La Boîte Noire (`01-blackbox`)

> [!abstract] Idée centrale de la démo
> **On possède un programme binaire qui calcule quelque chose, sans son code source.**
> On demande à l'agent d'analyser le binaire avec **REA** et d'écrire un programme Python autonome qui donne exactement les mêmes réponses. Puis on vérifie sa reconstruction sur des cas qu'il n'a jamais vus.

---

## 0. Coulisses — Préparation avant de monter sur scène

### Réinitialisation de l'arène et lancement de `tmux`

```bash
# 1. Nettoyage des anciennes arènes
rm -rf ~/rea-live.old.*

# 2. Reset de l'arène propre (crée ~/rea-live sans aucun spoiler)
cd ~/rea-demo
./stage_reset.sh

# 3. (Optionnel) Vérifier en coulisses que le banc de test fonctionne avec la référence privée
./holdout.sh 1789 .verity/reference_reimplementation.py

# 4. Ouvrir la scène tmux (2 panneaux : A = Agent à gauche, B = Moi à droite)
./rea_tmux.sh
```

- **Panneau A (Gauche, bleu — `~/rea-live`)** : L'arène isolée de l'agent. On y lance `claude`.
- **Panneau B (Droite, vert — `01-blackbox`)** : Le banc de contrôle du présentateur (`verify.py`, `holdout.sh`).

---

## 1. Acte I — Découvrir la boîte noire

> [!quote] Ce qu'on dit au public
> « Ce programme (`oracle`) reçoit trois nombres et renvoie un résultat. Le mot *oracle* désigne ici le programme de référence auquel on demande la bonne réponse. Nous n'avons pas son code source. »

### 1.1 Interroger le binaire sans l'ouvrir
*(Dans le **Panneau B — Droite**)*

Avant même d'utiliser un désassembleur, on cherche les chaînes de caractères présentes dans l'exécutable :

```bash
strings blackbox/oracle | grep usage
```

**Sortie :**
```text
usage: %s <dist_m> <vel_ms> <material 0-3>
```

> [!quote] Ce qu'on dit au public
> « Une chaîne de caractères, c'est un aveu : le programme dit lui-même comment il s'appelle et ce qu'il attend. Trois arguments — distance (`dist_m`), vitesse (`vel_ms`), matériau de `0` à `3`. Dix secondes, aucun outil. »

### 1.2 Tester un calcul de référence
*(Dans le **Panneau B — Droite**)*

On lui donne trois nombres (`distance = 100`, `vitesse = 10`, `matériau = 0`) :

```bash
./blackbox/oracle 100 10 0
```

**Sortie :**
```text
1.262000
```

Mais on ne connaît toujours pas la formule mathématique cachée derrière ce `1.262000`.

---

## 2. Acte II — L'intuition plausible mais insuffisante (`naive.py`)

> [!quote] Ce qu'on dit au public
> « Si on essaie de deviner la formule par intuition — par exemple une atténuation linéaire jusqu'à 1000 mètres et un bonus de 1 % par m/s de vitesse — on obtient `naive.py`. C'est une formule plausible… mais voyons ce qu'elle vaut sur 500 cas de test. »

### Tester `naive.py` contre les 500 cas de référence
*(Dans le **Panneau B — Droite**)*

```bash
python3 harness/verify.py --impl ~/rea-live/harness/naive.py --expected verdict/expected.csv
```

**Résultat :**
```text
match   : 47/500  (9.40%)
max err : 1.117000  (tol 0.001)

first 10 mismatches:
  dist_m   vel_ms mat   expected        got
 356.216    9.051   0   0.345000   0.702000
   79.68   32.153   2   1.769000   1.216000
 641.067   54.582   1   0.342000   0.555000
...
FAIL — 453 case(s) differ
```

> [!quote] Ce qu'on dit au public
> « Voici une formule plausible, mais incomplète. Elle ne reproduit que **47 réponses sur 500** (9,4 %). Une intuition sur le calcul ne suffit pas : il faut ouvrir le binaire pour retrouver son comportement réel. »

> [!info] Pourquoi `naive.py` échoue (points techniques si besoin)
> Cet échec ne vient pas d'une simple subtilité d'arrondi :
> 1. Il utilise une **décroissance linéaire** `(1000 - d) / 1000` au lieu d'une **décroissance au carré**.
> 2. Il utilise `0.01` comme coefficient de vitesse au lieu de `0.0137`.
> 3. Il **ignore complètement le matériau** et la table de 16 coefficients en mémoire.

---

## 3. Acte III — Le travail de l'agent avec REA

> [!quote] Ce qu'on dit au public
> « Je demande maintenant à l'agent d'analyser le binaire `./blackbox/oracle` avec **REA** (qui pilote Ghidra en arrière-plan) et d'écrire une fonction Python autonome `reimplementation.py` qui reproduit exactement son calcul, sans jamais appeler le binaire. »

### Lancer Claude et donner le prompt
*(Dans le **Panneau A — Gauche**, après avoir lancé `claude`)*

```text
Utilise REA (provider ghidra) pour rétro-ingénierer le binaire ./blackbox/oracle.

Extrais l'algorithme exact ainsi que toutes les constantes et tables de données en mémoire, puis réimplémente-le en Python pur dans ./harness/reimplementation.py avec la signature :

def compute(dist_m: float, vel_ms: float, material: int) -> float

Interdiction d'appeler le binaire depuis reimplementation.py (pas de subprocess/ctypes). Arrête-toi dès que ./harness/reimplementation.py est écrit, sans lancer les scripts de vérification dans ./harness/.
```

### Ce que l'agent découvre dans le binaire (`entry` @ `0x1000004b0`)
Pendant ou juste après l'analyse de Claude, voici ce qu'il extrait de l'assembleur ARM64 et de la mémoire :

1. **Lecture des entrées (`float32`)** : `d = strtof(argv[1])`, `v = strtof(argv[2])`, `m = atoi(argv[3])` borné entre `0` et `3`.
2. **Plafonnement de la distance** : `a = min(|d|, 1000.0)`
3. **Facteur de distance (au carré)** : `t = ((1000 - a) / 1000)²`
4. **Facteur de vitesse (`fma`)** : `g = 1.0 + v × 0.0137` (constante `0x3C6075F7`)
5. **Table de 16 flottants (`__const` @ `0x100000650`)** :
   `[0.61, 1.37, 0.92, 1.11, 1.83, 0.74, 1.29, 0.55, 1.04, 1.62, 0.88, 1.45, 0.69, 1.18, 0.97, 1.52]`
6. **Calcul d'index** : `idx = (5 * m + trunc(a * 0.016)) & 0xF` (constante `0x3C83126F`)
7. **Résultat brut et bornage** : `r = TABLE[idx] * (g * t)`, plafonné dans `[0.0, 250.0]`
8. **Arrondi final** : `round_half_away(r * 1000) / 1000` (arrondi au millième dans le calcul, puis affiché avec `%.6f` soit 6 décimales).

> [!tip] Exemple concret à la main pour `100, 10, 0`
> - **Distance (`a = 100`)** -> facteur `t = (1 - 100/1000)² = 0.81`
> - **Vitesse (`v = 10`)** -> facteur `g = 1 + 10 × 0.0137 = 1.137`
> - **Index dans la table** -> `idx = (5×0 + trunc(100 × 0.016)) & 15 = 1` -> `TABLE[1] = 1.37`
> - **Produit** -> `0.81 × 1.137 × 1.37 = 1.2617289`
> - **Arrondi au millième** -> **`1.262`** (affiché `1.262000`)

---

## 4. Acte IV — Vérification de la reconstruction

### 4.1 Inspecter le code produit par l'agent
*(Dans le **Panneau B — Droite**)*

On montre que `reimplementation.py` est bien du pur calcul Python (aucun appel caché à `./blackbox/oracle`) :

```bash
cat ~/rea-live/harness/reimplementation.py
```

### 4.2 Valider sur les 500 cas de référence
*(Dans le **Panneau B — Droite**)*

```bash
python3 harness/verify.py --impl ~/rea-live/harness/reimplementation.py --expected verdict/expected.csv
```

**Résultat attendu :**
```text
match   : 500/500  (100.00%)
max err : 0.000000  (tol 0.001)

PASS — matches the binary on all 500 probe cases (tested, not proven for every input)
```

---

## 5. Acte V — L'examen surprise (`holdout.sh`)

> [!quote] Ce qu'on dit au public
> « Maintenant, nous choisissons ensemble une graine aléatoire (*seed*) pour générer **500 nouvelles questions** qui n'existaient pas pendant l'analyse de l'agent. Nous posons les mêmes questions au binaire original et à la reconstruction Python, puis nous comparons. »

### Lancer l'examen surprise avec un nombre donné par la salle
*(Dans le **Panneau B — Droite** — remplacer `1789` par le nombre choisi en direct par le public)*

```bash
./holdout.sh 1789
```

**Ce que fait `holdout.sh` en coulisses :**
1. Vérifie par filtre anti-triche que `reimplementation.py` n'importe ni `subprocess`, ni `os.system`, ni `ctypes`/`cffi`.
2. Génère 500 nouveaux cas aléatoires à partir de la graine (`gen_cases.py --n 500 --seed <SEED>`).
3. Interroge le binaire `./oracle` sur ces 500 cas (`probe.py`).
4. Compare avec `~/rea-live/harness/reimplementation.py` (`verify.py`).

**Résultat attendu :**
```text
examen surprise — seed 1789 — 500 cas jamais vus par l'agent

match   : 500/500  (100.00%)
max err : 0.000000  (tol 0.001)

PASS — matches the binary on all 500 probe cases (tested, not proven for every input)
```

> [!quote] Conclusion orale à retenir
> « Si les 500 réponses correspondent, nous avons une **validation expérimentale solide** sur ces cas. Nous n'avons pas une preuve mathématique pour toutes les entrées possibles, mais nous avons reconstruit fidèlement le comportement du binaire et vérifié cette reconstruction par des tests indépendants. »

---

## Annexe — Aide-mémoire technique & Nuances (Q&A)

### A. Rôle des fichiers du dossier `harness/`

```text
                       ┌──> oracle (binaire) ──> réponses de référence (expected.csv)
500 mêmes questions ───┤
  (cases.csv)          └──> Python (compute) ──> réponses reconstruites
                                                        │
                                                        ▼
                                             comparaison (verify.py)
```

| Fichier | Rôle concret |
| :--- | :--- |
| `gen_cases.py` | Génère des questions aléatoires : triplets `(dist_m, vel_ms, material)` dans un fichier CSV. |
| `cases.csv` | Fichier contenant les 500 cas de test d'entrée. |
| `probe.py` | Pose chaque question de `cases.csv` au binaire `oracle` et enregistre la vérité terrain dans `expected.csv`. *(Lui seul a le droit d'appeler le binaire).* |
| `naive.py` | Reconstruction volontairement simpliste (linéaire, coefficient `0.01`, ignore `material`) conçue pour montrer un `FAIL` (`47/500`). |
| `reimplementation.py` | Fichier produit par l'agent dans `~/rea-live/harness/reimplementation.py` contenant la fonction reconstruite `compute(dist_m, vel_ms, material)`. |
| `verify.py` | Pose les mêmes questions à la fonction Python `compute()` et compare ses réponses à `expected.csv` avec une tolérance de `1e-3` (`0.001`). |
| `holdout.sh` | Enchaîne `gen_cases.py` + `probe.py` + `verify.py` sur 500 nouvelles questions tirées à partir d'une graine (`seed`) choisie par la salle. |

### B. Les 4 nuances importantes si le public pose des questions

1. **Que signifie réellement `500/500` ?**
   Cela signifie : *« Sur ces 500 questions, les réponses des deux programmes correspondent avec la tolérance choisie (`0.001`). »* Ce n'est pas une preuve formelle sur l'infinité des entrées possibles (`gen_cases.py` explore des distances de `0` à `1100`, des vitesses de `0` à `60` et les matériaux `0` à `3`, sans tester `NaN` ou des vitesses négatives).
2. **Pourquoi choisir une nouvelle graine (*seed*) avec la salle ?**
   Même graine = mêmes questions. Pour que l'examen surprise soit réellement indépendant, la salle choisit une graine inédite **après** que l'agent a terminé d'écrire `reimplementation.py`.
3. **Différence entre les deux commandes `holdout.sh` :**
   - `./holdout.sh 1789 .verity/reference_reimplementation.py` -> teste notre référence privée de répétition (pour vérifier le matériel avant la démo).
   - `./holdout.sh <SEED>` -> teste `~/rea-live/harness/reimplementation.py`, c'est-à-dire le code écrit en direct par l'agent.
4. **Arrondi au millième vs `%.6f` :**
   Le format `%.6f` affiche **6 chiffres après la virgule** (`1.262000`), mais le binaire arrondit lui-même sa valeur au **millième** (`round(r * 1000) / 1000`) avant de l'afficher.

