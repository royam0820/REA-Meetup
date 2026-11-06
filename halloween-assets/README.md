# Assets Halloween — T-Rex Runner (re-skin)

Kit de re-skin complet du jeu du dinosaure de Chrome (`wayou/t-rex-runner`) en
thème Halloween. Les deux feuilles de sprites ont **exactement la même géométrie**
que les originales : les coordonnées dans `index.js` (`Runner.spriteDefinition`,
`Trex.animFrames`, obstacle types) restent **inchangées**. Aucune constante de
gameplay n'est modifiée — seul le rendu change.

## Contenu

| Fichier | Description |
|---|---|
| `100-offline-sprite-halloween.png` | Feuille LDPI (1233x68), remplace `assets/default_100_percent/100-offline-sprite.png` |
| `200-offline-sprite-halloween.png` | Feuille HDPI (2466x136), remplace `assets/default_200_percent/200-offline-sprite.png` |
| `sprites/` | Chaque sprite découpé individuellement (PNG transparent) |
| `generated/` | Sorties brutes de génération IA (haute résolution) |
| `verify_scene.png` | Scène de jeu simulée (aperçu du rendu) |
| `contact_sheet.png` | Planche contact des sprites bruts générés |

## Mapping des sprites (feuille LDPI, origine x,y / taille)

| Zone | Position | Taille | Rôle dans le jeu | Remplacement Halloween |
|---|---|---|---|---|
| RESTART | 2, 2 | 36x32 | bouton rejouer | citrouille jack-o'-lantern avec flèche |
| CLOUD | 86, 2 | 46x14 | nuages d'ambiance | nuage violet orageux + chauves-souris miniatures |
| PTERODACTYL | 134, 2 / 180, 2 | 46x40 x2 | obstacle volant (2 frames) | chauve-souris vampires (ailes haut / ailes basses) |
| CACTUS_SMALL | 228 / 245 / 279 | 17x35, 34x35, 51x35 | obstacles solo/double/triple | petites tombes RIP (1, 2, 3) |
| CACTUS_LARGE | 332 / 357 / 407 | 25x50, 50x50, 75x50 | obstacles solo/double/triple | grandes tombes + croix (1, 2, 3) |
| MOON | 484, 2 (et 504) | 20x40 x2 phases | lune du mode nuit | lune orange de récolte (teintée) |
| STAR | 645, 2 | 9x9 | étoiles du mode nuit | étoile lavande (teintée) |
| TEXT_SPRITE | 655, 2 | 191x13 | chiffres 0-9, H, I, texte GAME OVER | même géométrie teintée orange phosphorescent |
| TREX frame 0 | 848, 2 | 44x47 | pose saut (JUMPING) | chat noir debout |
| TREX frame 44 | 892, 2 | 44x47 | attente (WAITING) | chat noir, patte levée |
| TREX frame 88 | 936, 2 | 44x47 | course frame 1 | chat courant, foulée 1 |
| TREX frame 132 | 980, 2 | 44x47 | course frame 2 | chat courant, foulée 2 |
| TREX frame 176 | 1024, 2 | 44x47 | **inutilisé** par le code | réutilise la pose saut |
| TREX frame 220 | 1068, 2 | 44x47 | crash (CRASHED) | chat étourdi, yeux en X, étoiles |
| TREX frame 264 | 1112, 2 | 59x47 | couché frame 1 (DUCKING) | chat aplati, course basse 1 |
| TREX frame 323 | 1171, 2 | 59x47 | couché frame 2 (DUCKING) | chat aplati, course basse 2 |
| HORIZON | 2, 54 (et 2, 61) | 600x6 x2 lignes | lignes du sol | lignes teintées violet |
| (hors feuille) | — | 72x72 | icône d'erreur de la page | `sprites/error_icon.png` teinté orange |

Feuille HDPI : mêmes éléments aux positions doublées
(`Runner.spriteDefinition.HDPI`) : TREX 1678, TEXT 1294, CACTUS_LARGE 652,
CACTUS_SMALL 446, CLOUD 166, HORIZON y=104, MOON 954, PTERODACTYL 260,
RESTART 2,2, STAR 1276. Obstacles groupés : double = x + largeur, triple = x + 3x largeur.

## Palette

- Fond nuit : `#1a0b2e` (violet très sombre)
- Orange citrouille : `#ff8214` (yeux du chat, score, citrouilles)
- Orange lune : `#ffb350`
- Violet : `#8a7ca8` / lavande `#bea5eb` (nuages, étoiles, lignes du sol)
- Tombes : gris pierre (d'origine, sur fond sombre)

## Intégration (5 minutes, dans `t-rex-halloween/`)

1. **Remplacer les feuilles** (garder les noms d'origine, `index.html` les charge par ID) :
   ```bash
   cp 100-offline-sprite-halloween.png assets/default_100_percent/100-offline-sprite.png
   cp 200-offline-sprite-halloween.png assets/default_200_percent/200-offline-sprite.png
   ```
2. **Fond nuit permanent** — `index.js` ligne ~369 : remplacer
   `this.canvasCtx.fillStyle = '#f7f7f7';` par `'#1a0b2e'`.
3. **Désactiver l'inversion** (sinon l'écran redevient clair tous les 700 m) —
   `index.js` : `INVERT_DISTANCE: 700` → `INVERT_DISTANCE: Number.MAX_SAFE_INTEGER`.
4. **Fond de page** — `index.html` : passer le fond du body sur `#1a0b2e`.
5. **Icône d'erreur** : remplacer `assets/default_100_percent/100-error-offline.png`
   par `sprites/error_icon.png`.

Les sons (`offline-sound-*.mp3`) sont conservés tels quels.

## Notes

- La pose du chat en frame « saut » reprend la pose debout, comme l'original.
- Les doubles tombes sont composées des versions simples (miroir + décalage
  d'1-2 px) pour varier sans génération supplémentaire.
- Licence : le dépôt d'origine est en BSD-3-Clause — conservez la notice de
  licence dans toute redistribution.
