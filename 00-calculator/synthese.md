# Synthèse : pourquoi `./calc 200+10%` affiche 220 et non 210

## Réponse

Pour `+` et `-`, le `%` signifie « pourcentage de l'opérande de gauche ». Le programme calcule 10 % de 200 = 20, puis 200 + 20 = **220**.
Pour obtenir 210, il suffit d'écrire `200+10` sans `%`.

## Cible analysée

- Binaire : `calculator/calc`, Mach-O arm64, strippé
- SHA-256 : `b1ed83cb61877883e6388e8fcd85595709a47776fc168177bbb9cae3864a9480`
- Outil : REA avec le provider Ghidra 12.1.4
- Fonction utilisateur unique : `entry` à `0x100000460` (la logique `apply` est inlinée dedans)

## Preuve (désassemblage, evidence `ev_4f9462b65e202606e66221696075b1ee6c24585472caa2d3f9d45f165aca2059`)

| Étape | Adresse | Instruction | Effet |
|---|---|---|---|
| Lecture | `0x10000049c` | `sscanf("%lf%c%lf%c")` | a=200, op=`+`, b=10, suffixe=`%` |
| Test du `%` | `0x1000004d4` | `cmp w9, #0x25` | le suffixe est-il `%` ? |
| Test de l'opérateur | `0x1000004dc–e8` | comparaisons avec `0x2d` (`-`) et `0x2b` (`+`) | `+` et `-` passent par le calcul « % de a » |
| Multiplication | `0x1000004ec` | `fmul d1, d0, d1` | 200 × 10 = 2000 |
| Division | `0x1000004f0–f8` | `fdiv` par `0x4059000000000000` (= 100.0) | 2000 / 100 = 20 |
| Addition | `0x100000518` | `fadd d0, d0, d1` | 200 + 20 = **220** |

Pour `*` et `/`, la multiplication par `a` est sautée et b est seulement divisé par 100 : `200*10%` donne 20.

## Cohérence avec le source

`calc.c:7` : `b = a * b / 100.0; // % of the left operand`. Le binaire correspond au source.

## Limites

1. **Analyse statique uniquement.** Le binaire n'a pas été exécuté. Le résultat 220 est déduit de la lecture des instructions, pas observé à l'exécution.
2. **Pseudo-code Ghidra incomplet.** Le décompilateur a supprimé les blocs d'arithmétique (« unreachable block ») et n'a gardé que `sscanf` et `printf`. La preuve repose donc sur l'assembleur, lu à la main.
3. **Binaire strippé.** Il n'y a pas de symbole `apply`. Le rapprochement avec le source est une inférence fondée sur la structure du code (constante 100.0, comparaisons `+`/`-`/`*`/`/`), pas une correspondance garantie.
4. **Source et binaire non liés formellement.** Rien ne prouve que `calc` a été compilé à partir de ce `calc.c`. Ils concordent, mais c'est une observation, pas une preuve de provenance.
5. **Portée.** L'analyse n'explique que le cas `200+10%` et la logique des quatre opérateurs. Elle ne couvre pas les cas limites (entrée invalide, division par zéro, espaces, etc.).
