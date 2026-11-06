# Synthèse REA: décomposition du T-Rex Runner

**Cible**: https://wayou.github.io/t-rex-runner/ (code Chromium non minifié, extrait par @liuwayong)
**Objectif**: préparer une reconstruction avec un nouveau thème visuel

## Méthode
| Étape | Outil REA | Résultat |
|---|---|---|
| Cartographie et capture runtime | `capture_browser_scenario` (Chrome lancé, Espace, 3 sauts, game over) | E1 `ev_b0aedc1173fa81a6fbabe8b2a425eb5986ac4273872314139081d2e7288acaa7` |
| Export des scripts | `export_web_scripts` (provider `rea-web-script-export`) | E2 `ev_35d44d54aec6363ac776af8bba4503c23a563288db4508864a5dd8877cb5a2a9` |
| Analyse statique | `analyze_javascript_application` (provider `rea-analysis-view`) | E3 `ev_e8295b7432e9603a3d4718d4f6829a367fd712e7c6353fb49644e8aaae53d692` (vue `ev_e3b3e786969a7cd9b16e9868aa675d34ffa99a321ddafb146f633dd36d495061`) |

L'analyse statique REA n'a presque rien apporté: le fichier est un seul IIFE, donc 0 module et 0 finding. Les constantes viennent de la lecture directe de `index.js`.

## Architecture
- **Page**: `index.html`, `index.css`, `index.js`, et la police Open Sans de Google Fonts.
- **Rendu**: un `canvas.runner-canvas` (600×150) créé par le JS.
- **Classes**: `Runner` (orchestrateur), `Trex`, `Horizon` (`HorizonLine`, `Cloud`, `NightMode`, obstacles), `Obstacle`, `DistanceMeter`, `GameOverPanel`, `CollisionBox`.
- **Boucle**: `requestAnimationFrame` avec `deltaTime`, `FPS` = 60.
  1. Physique du saut.
  2. Défilement de l'horizon (après l'intro de 1,5 s).
  3. Obstacles actifs après 3 s.
  4. Collision AABB.
  5. Score et mode nuit.
- **Entrées**: haut ou Espace pour sauter, bas pour se baisser, Entrée pour recommencer, tactile.
- **Réseau**: 8 requêtes statiques, aucune API.

## Constantes à préserver
| Domaine | Valeurs |
|---|---|
| Vitesse | départ 6, accélération 0,001 par frame, max 13 |
| Saut | vitesse initiale −10 − vitesse/10, gravité 0,6, vitesse de chute rapide −5 (`DROP_VELOCITY`), coefficient 3 avec bas pressé (`SPEED_DROP_COEFFICIENT`), hauteur min. 30, hauteur max. 30 |
| T-Rex | 44×47 (59×25 baissé), x de départ 50 |
| Obstacles | petit cactus 17×35, grand cactus 25×50, ptérodactyle 46×40 (vitesse min. 8,5, y 100/75/50) |
| Génération | 1 à 3 cactus groupés, doublon max. 2, écart = `round(largeur·vitesse + minGap·0,6)` puis tirage entre ce minimum et 1,5 fois ce minimum |
| Score | distance × 0,025, 5 chiffres, flash tous les 100 points |
| Mode nuit | tous les 700 points, fondu de 12 s |
| Nuages | max 6, gap 100–400 |

Les valeurs `MIN_JUMP_HEIGHT` et `MAX_JUMP_HEIGHT` sont dupliquées entre `Runner.config` (35) et `Trex.config` (30). C'est la valeur de `Trex.config` qui est utilisée dans le saut.

## Assets à re-thémer
- **Sprite 1x**: `assets/default_100_percent/100-offline-sprite.png` (1233×68).
- **Sprite 2x**: `assets/default_200_percent/200-offline-sprite.png` (2441×130).
- **Contenu des sprites** (dino, cactus, ptéro, nuage, sol, lune, étoiles, restart): coordonnées dans `Runner.spriteDefinition`.
- **Police du score et de « GAME OVER »**: glyphes pixel dans le sprite, pas de vraie police.
- **Icône initiale**: `100-error-offline.png` (72×72).
- **Sons**: 3 `<audio>` en `data:` base64 dans l'HTML (saut, collision, palier de 100 points).
- **Palette**: gris sur blanc, plus la classe CSS `inverted` pour la nuit.
- **Open Sans**: chargée mais probablement inutilisée (inféré).

## Résultat observé
Game over au 3e saut raté, score **47** (`HI 00047`).

## Inconnues
- **Capture** marquée « incomplete » (section d'événements manquante). Corps de réponse issus de l'API Playwright, pas forcément identiques aux octets réseau.
- **`inspect_web_page` non utilisé**: il demande un navigateur déjà ouvert avec CDP, donc un seul screenshot, en fin de partie.
- **Ptérodactyle, mode nuit et son**: jamais observés en runtime, lus dans le code seulement.
- **Couleurs exactes des pixels**: non mesurées.
- **`200-error-offline.png`**: référencé par le CSS mais non chargé.
- **Script inline de `index.html`** (masque `#messageBox` au premier Espace): ajout hors Chromium, contenu non examiné.

## Suite possible
- Second run plus long, avec capture après chaque étape, pour voir le ptérodactyle et le mode nuit.
- Mesurer la palette du sprite.
- Découper le sprite en assets individuels pour le nouveau thème.
