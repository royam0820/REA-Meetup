# REA — Reverse Engineering Anything (Meetup)

Matériel du meetup : un dossier par démo, plus le guide d'installation et les slides.

## 📑 Présentation

**[Télécharger / ouvrir le deck du meetup (PDF)](https://cdn.jsdelivr.net/gh/royam0820/REA-Meetup@main/rea_meetup_deck_v2-rev.pdf)**

Le même fichier est aussi dans le dépôt : [`rea_meetup_deck_v2-rev.pdf`](rea_meetup_deck_v2-rev.pdf).

## 🧭 Contenu du dépôt

```
REA/
├── 00-calculator/          Binaire natif + source (calc.c) — décompilation avec Ghidra
├── 01-blackbox/            Démo 1 : la boîte noire (binaire sans source → réimplémentation Python)
├── 04-dino-chrome-game/    Démo 3 : décomposition du site Chrome Dino (analyse REA + site local jouable)
├── 05-halloween-demo/      Démo 3 (suite) : recomposition en thème Halloween (runner + slides)
├── halloween-assets/       Kit de re-skin Halloween (feuilles de sprites, sprites découpés)
├── installation-rea-meetup.md   Guide pour reproduire la démo chez soi
└── rea_meetup_deck_v2-rev.pdf   Slides du meetup
```

### 00 — Calculator
`calc.c` et le binaire `calc` : point de départ pour la décompilation native (Ghidra via REA).

### 01 — Blackbox
On possède un binaire (`oracle`) sans son code source. L'agent l'analyse avec REA, écrit un programme Python qui donne les mêmes réponses, puis la reconstruction est vérifiée sur des cas jamais vus (*holdout*).

- `Makefile`, `holdout.sh`, `stage_reset.sh`, `rea_tmux.sh` — mise en place et réinitialisation de l'arène
- `harness/` — génération des cas (`gen_cases.py`), sondage (`probe.py`), version naïve (`naive.py`) et vérification (`verify.py`)
- `scenario-demo-01-blackbox.md` — déroulé complet de la démo

### 04 — Dino Chrome Game (décomposition)
Analyse REA du jeu T-Rex Runner de Chrome (chunk webpack `809.js`) : analyse statique du bundle, confirmation à l'exécution par capture réseau.

- `analysis/` — rapport d'analyse (`rea_analysis_report.md`), bundle d'evidence et synthèse
- `site/` — site local jouable (`index.html`, `game.html`, `play.html`)

### 05 — Halloween Demo (recomposition)
Le jeu recomposé en thème Halloween (chat/fantôme, tombes, chauves-souris) à partir de l'analyse REA.

- `runner/` — jeu autonome, serveur statique sans dépendance :
  ```bash
  cd 05-halloween-demo/runner
  node server.mjs            # puis ouvrir http://localhost:<port> (options : --host, --port)
  ```
- `slides/` — slides de la démo (`.pptx`) et script de génération de la scène

### halloween-assets
Kit de re-skin complet : feuilles de sprites LDPI/HDPI à géométrie identique aux originales (aucune constante de gameplay modifiée), sprites individuels, sorties brutes de génération IA et aperçus. Voir [`halloween-assets/README.md`](halloween-assets/README.md) pour le mapping des sprites.

## 🛠️ Reproduire la démo

Le guide [`installation-rea-meetup.md`](installation-rea-meetup.md) couvre :

1. Installation de REA (`npm install -g rea-agents`) et enregistrement auprès du client agent
2. Configuration de Ghidra (décompilation native) et JADX (extraction d'APK)
3. Décomposition / recomposition d'un site web (Chrome Dino)
4. Vérification finale et dépannage

Prérequis : Node.js, Java 17+, Ghidra, JADX MCP JAR 0.7.1 (non fournis par REA).

## Notes
- La démo Cozmo APK (`02-cozmo-apk`), les APK, les sorties générées (`output/`, `web/`) et les outils locaux ne sont pas publiés dans ce dépôt.
