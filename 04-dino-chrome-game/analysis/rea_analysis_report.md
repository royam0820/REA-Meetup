# Rapport d'analyse REA — site `dino_rea` (dinorunner)

**Date :** 2026-10-26
**Périmètre :** chunk webpack `809.js` et ses dépendances (`54.js`), site servi depuis `03-dino-chrome-game/site/`
**Bundle d'evidence :** `03-dino-chrome-game/analysis/rea_evidence_bundle.json` (13 records, 18 768 237 octets, ordre canonique)

---

## 1. Résumé exécutif

Le chunk `809.js` est le jeu « T-Rex Runner » (Chrome Dino) empaqueté en chunk webpack
n° 809 (`webpackChunkdinorunner`), module **9809**, unique canal réseau vers le backend :
deux POST authentifiés (`window.IS_AUTH`) vers `/api/statistics/` (démarrage) et
`/api/results/` (game over), implémentés dans le module **9054** du chunk `54.js` via un
wrapper axios (module 227). La chaîne complète a été **prouvée statiquement** (graphe
sémantique REA) puis **confirmée à l'exécution** (capture réseau contrôlée avec corps de
requête).

## 2. Passe 1 — Analyse statique du bundle (capture CDP)

- Méthode : `analyze_web_bundle` sur `game.html` servi localement (Chrome headless CDP).
- **9/9 sources capturées, statut `complete`** : `game.html` (3 inline), `app.js`,
  `229.js`, `54.js`, `77.js`, `809.js`, `dino_default.js`.
- **Identité vérifiée** : SHA-256 du 809.js capturé = SHA-256 du fichier local
  `1f12b895d51f6455ca6f15c10d14f4eed487f4a5055ca1f16e77f6398b3920bf`.
- **0 route applicative, 0 endpoint en dur** : jeu 100 % client ; le réseau passe
  exclusivement par le module 9054 (URL construites dynamiquement par `concat`).
- Pas de source map servie ni récupérée.
- Evidence : `ev_29ed49f02999eb3a48212a54cf171d43131ae4bed6cbe521450bf89234a7bb37`.

## 3. Passe 2 — Graphe applicatif et trace sémantique

- Méthode : `analyze_javascript_application` sur `809.js` + `54.js`
  (Evidence `ev_3deea7895dce066596307000936d26071fd69c7e8e90fd0a284f32fe941f2e07`).
- Graphe de modules : `809.js` déclare une référence `require:9054` (déduite, confiance
  faible) ; `54.js` expose le module observé `webpackChunkdinorunner:module 9054`.
- Trace `postStatistics` (requêtes `jsrq_a446593f…`, `jsrq_0091d493…`) :
  - **Export** `54.js` ligne 2, colonnes 10985–11001 et 11164–11180.
  - **Lectures** `809.js` ligne 1, colonnes 11664–11680 (`startGame`) et 17951–17967
    (`restart`).
  - Statut **« ambiguous »** : 0 relation résolue, 4 inconnus `object-flow`
    (`ambiguous-target`) — le registre webpack inter-chunks est dynamique et REA
    n'exécute jamais le bootstrap ; l'arête import/export n'est pas fusionnable
    statiquement. Position exacte certifiée aux deux bouts.
- Chaîne complète (lecture statique des sources) :
  1. `809.js`/9809 : sous garde `window.IS_AUTH`, `startGame` + `restart` →
     `postStatistics({data:{started:true, level:LEVEL_CURRENT_UUID}})` ; `gameOver` →
     `postResults({data:{scores, passed, start, lang:LANG_UUID, level}})`.
  2. `54.js`/9054 : `api.post` vers `/api/statistics/`, `/api/results/`,
     `/api/change-status/` (exporté, **jamais appelé** par le jeu).
  3. `54.js`/227 (axios) : POST JSON, en-têtes `Content-Type: application/json` +
     `x-requested-with: XMLHttpRequest`, throw si corps `status == "ERROR"`.

## 4. Passe 3 — Vérification runtime (capture contrôlée)

- Méthode : page de test `rea_runtime_test.html` (`IS_AUTH=true` + UUIDs de test
  injectés), scénario : Espace puis 30 s de jeu. Evidence `ev_88b02c52…`,
  autorité `controlled-replay`.
- **`POST /api/statistics/`** à 22:43:12.752Z (~0,5 s après le saut, fin d'intro CSS) —
  corps 63 octets (SHA-256 `ec5be624…`) :
  `{"started":true,"level":"11111111-2222-3333-4444-555555555555"}`.
- **`POST /api/results/`** à 22:43:19.135Z (**6,4 s** après démarrage — crash sur
  obstacle sans intervention) — corps 142 octets (SHA-256 `fe31ea56…`) :
  `{"scores":66,"passed":6401,"start":1793054592746,
    "lang":"99999999-8888-7777-6666-555555555555",
    "level":"11111111-2222-3333-4444-555555555555"}`.
- Aucun appel à `/api/change-status/` observé.
- Limites : réponses 501 (serveur de test sans backend `/api/*`) — seule la requête
  sortante est prouvée ; pas de pile d'initiateur (limitation Playwright).

## 5. Écarts par rapport au runner Chromium upstream

1. Télémétrie `IS_AUTH` : `postStatistics` / `postResults` avec UUID de niveau et langue.
2. Overlay d'aide mobile custom (`.game__help`, `.game__tap`, bouton saut tactile).
3. Événement custom `game-start` dispatché sur `document` au premier saut.
4. Code mort hérité : `setupDisabledRunner` référence `loadTimeData` (non défini),
   `isDisabled()` retourne toujours `false`.

## 6. Inventaire des artifacts

| Fichier | SHA-256 (préfixe) | Rôle |
|---|---|---|
| `site/js/809.js` | `1f12b895…` | Chunk 809, module 9809 — moteur du jeu |
| `site/js/54.js` | `87f3c5f7…` | Chunk 54, modules 9054 (API) + 227 (axios) |
| `site/js/app.js` | `91f38f3a…` | Bootstrap applicatif (hors périmètre approfondi) |
| `site/js/229.js` | `6678928a…` | Vendor (hors périmètre) |
| `site/js/77.js` | `dc822fe8…` | Vendor (hors périmètre) |
| `site/js/dino_default.js` | `e2ae49e7…` | Script par défaut (hors périmètre) |
| `rea_evidence_bundle.json` | — | Bundle Evidence REA (13 records) |
| `rea_runtime_test.html` | — | Page de test runtime (reproduction) |

## 7. Inconnus résiduels (déclarés par REA)

- Ensemble complet des routes côté serveur (hors périmètre du chunk).
- Relations traversant les 4 fichiers non sélectionnés de `analyze_javascript_application`.
- 4 022 inconnus sémantiques résiduels dans le périmètre analysé (syntaxe dynamique).
- Traitement serveur réel des endpoints `/api/*` (aucun backend dans l'artifact).

## 8. Analyse d'intégrité du score (frontière de confiance)

**Constat structurel :** le score est calculé intégralement côté client et auto-déclaré en
clair sur `/api/results/`. Rien dans le pipeline 9809 → 9054 → axios ne signe, ne hache
ni ne relie la donnée à une session serveur.

### Ce que le client envoie et comment c'est produit

| Champ | Source (809.js) | Forgeable |
|---|---|---|
| `scores` | `round(distanceRan × 0,025)`, `distanceRan` incrémenté par la boucle de jeu | oui, directement |
| `passed` | `ceil(runningTime)` ms, horloge client | oui (antidatage `start`) |
| `start` | `+new Date` au démarrage — horodatage **choisi par le client**, aucun nonce serveur | oui |
| `level` / `lang` | variables globales du template HTML (snapshots : `'1'`, `'1'`) | oui |
| cookies session | envoyés automatiquement (XHR same-origin) | réutilisables via curl |

### Bornes physiques qu'un serveur peut vérifier

- Vitesse max théorique : `MAX_SPEED 13 px/frame × 60 fps = 0,78 px/ms` →
  `scores ≤ 0,0195 × passed + ε`.
- Run légitime capturé (passe 3) : `66 / 6401 = 0,0103 ms⁻¹` (≈ 53 % du max théorique,
  cohérent avec la phase d'accélération et l'intro).
- Contraintes temporelles possibles : `passed` ≥ durée d'intro (~1,5–2 s), `start` non
  futur et proche de la réception, unicité de `(level, start)` par session.

### Vecteurs d'attaque

1. **Forgery directe** — console navigateur ou `curl` avec le cookie de session :
   POST arbitraire sur `/api/results/` ; `x-requested-with` est spoofable, aucun jeton
   CSRF, aucune signature.
2. **Hooking client** — patcher `Runner.config` (SPEED/ACCELERATION), surcharger
   `getActualDistance`, ou appeler `postResults` sans même lancer le jeu.
3. **Rejeu** — requête capturée rejouable ; aucun nonce ni compteur.
4. **Antidatage** — `start` reculé pour gonfler `passed` ; détectable seulement par les
   bornes ratio/taux.
5. **Absence de ground truth serveur** — les obstacles sont générés par `Math.random()`
   côté client, sans seed engagé : le serveur ne peut pas re-simuler une run.

### Rôle réel de `IS_AUTH`

`IS_AUTH` (statique `false` dans ce snapshot, injecté par template en production) est
un **simple autorail d'émission** : il conditionne l'envoi, pas la vérité des données.
Il n'apporte aucune intégrité.

### Verdict

`/api/results/` est un intake de score auto-déclaré : le client est l'autorité finale.
Toute classification (leaderboard, récompenses) alimentée par cet endpoint est
falsifiable à coût nul par un utilisateur authentifié. Seules des heuristiques serveur
(borne ratio `scores/passed`, anti-doublon sur `(level, start)`, rate-limiting,
horodatage de session côté serveur — voire un token de tentative émis au `start`)
peuvent resserrer le modèle ; le passage à un token de tentative serveur est la seule
correction structurelle.

## 9. Reproduction

1. Servir `03-dino-chrome-game/site/` en HTTP local et lier `assets/js` → `js` (les pages
   référencent `/assets/js/`).
2. Passe statique : `analyze_web_bundle` / `analyze_javascript_application` (REA MCP).
3. Passe runtime : scénario `capture_browser_scenario` sur `rea_runtime_test.html`
   (attente 2,5 s → `press Space` → attente 30 s), capture réseau `request_body`.
