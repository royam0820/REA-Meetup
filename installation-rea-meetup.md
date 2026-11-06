# Installer REA pour répliquer la démo du meetup

Ce guide permet aux participants de reproduire la démonstration présentée au meetup :

1. **Décompilation de binaires natifs** avec Ghidra (provider REA `ghidra`)
2. **Extraction des sources d'un APK** avec JADX (provider REA `jadx`)
3. **Décomposition d'un site web** (Chrome Dino) et sa **recomposition** avec un thème Halloween (AgentEnv / bundle d'environnement)

---

## 1. Prérequis

REA ne installe **aucun** des logiciels ci-dessous : Ghidra, JADX, Java, Node.js sont à fournir vous-même (*bring-your-own*).

| Composant | Requis pour | Version minimale |
|---|---|---|
| Node.js | REA lui-même | compatible avec le runtime REA (voir `rea doctor`) |
| Java (JDK) | JADX, Ghidra | **Java 17+** |
| Ghidra | Décompilation native (partie 1) | version headless supportée par REA |
| JADX MCP JAR (headless) | Analyse APK (partie 2) | **0.7.1** |

Vérifications rapides :

```bash
node --version
java -version
```

---

## 2. Installer REA

### Option A — installation globale (recommandée)

```bash
npm install -g rea-agents
```

### Option B — sans installation, via `npx` (version épinglée)

```bash
npx -y rea-agents@6.8.0 --help
```

> Dans la suite du guide, les commandes utilisent `rea`. Remplacez par `npx -y rea-agents@6.8.0` si vous n'avez pas fait l'installation globale.

---

## 3. Enregistrer REA auprès de votre client agent

REA fonctionne comme serveur MCP. L'installation du skill seul **n'enregistre pas** le serveur : il faut passer par `rea setup`.

### 3.1 Diagnostiquer l'état actuel

```bash
rea doctor --json
```

Si votre client n'est pas détecté, précisez-le (exemples : `claude_code`, `claude_desktop`, `codex`, `cursor`, `gemini_cli`, `vscode`…) :

```bash
rea doctor --client <votre_client> --json
```

### 3.2 Préparer puis appliquer le plan d'installation

Toujours commencer par un *dry-run* pour voir les chemins, sauvegardes et changements proposés :

```bash
rea setup --client <votre_client> --dry-run --json
```

Puis appliquer :

```bash
rea setup --client <votre_client> --yes
```

> N'ajoutez `--install-hopper` que si vous en avez explicitement besoin (Hopper est optionnel ; la démo utilise Ghidra).

### 3.3 Redémarrer / reconnecter le client

Après `setup`, **redémarrez votre client agent** pour que les outils `rea` apparaissent dans la session. Vérifiez qu'ils sont bien listés avant de continuer.

---

## 4. Configurer Ghidra (décompilation de binaires)

La décompilation native de la démo repose sur le provider Ghidra de REA.

1. Installez Ghidra depuis https://ghidra-sre.org (REA l'utilise en mode headless ; aucun plugin supplémentaire à installer côté Ghidra).
2. Vérifiez que Ghidra est visible dans l'environnement qui démarre REA (`PATH` / `GHIDRA_HOME` selon votre installation).
3. Vérifiez le provider :

```bash
rea doctor --provider ghidra --json
```

Astuce démo : le premier appel Ghidra inclut l'import et l'auto-analyse du binaire (jusqu'à ~330 s par défaut). Pour un gros binaire, augmentez le délai de démarrage :

```bash
REA_GHIDRA_STARTUP_TIMEOUT_MS=1800000 rea analyze /chemin/vers/binaire --provider ghidra --json
```

Workflow MCP utilisé en démo : `open_binary` → `binary_overview` → `list_procedures` → `procedure_pseudo_code`.

---

## 5. Configurer JADX (extraction des sources d'un APK)

Le provider Android de REA requiert un **JADX headless fourni séparément** — REA ne l'installe pas.

1. Installez un **JDK 17+** et définissez `JAVA_HOME` si nécessaire.
2. Récupérez le **JADX MCP JAR headless version 0.7.1**.
3. Pointez REA vers le JAR via la variable d'environnement :

```bash
export REA_JADX_MCP_JAR=/chemin/vers/jadx-mcp-0.7.1.jar
```

4. Vérifiez la configuration :

```bash
rea doctor --provider jadx --json
```

Variables utiles pour la démo :

```bash
export REA_JADX_HEAP_MIB=4096                  # heap JVM pour les gros APK
export REA_JADX_OPERATION_TIMEOUT_MS=120000    # délai par opération
```

Workflow MCP utilisé en démo : `inspect_android_package` → `search_android_classes` → `inspect_android_class` / `inspect_android_method` → extraction des sources via JADX.

---

## 6. Décomposition / recomposition d'un site web (Chrome Dino)

Cette partie ne nécessite **ni Ghidra ni JADX**. Deux approches :

### 6.1 Analyse statique JavaScript (suffisante pour comprendre le jeu)

```bash
rea analyze-javascript-application /chemin/vers/arborescence-js --json
```

Ou, sans installation MCP (fallback CLI complet) :

```bash
npx -y rea-agents@6.8.0 analyze-javascript-application /chemin/vers/arborescence-js --json
```

### 6.2 Capture navigateur + reconstruction (AgentEnv)

Pour rejouer les interactions et reconstruire le site (ex. thème Halloween), REA pilote un navigateur :

- en MCP : `capture_browser_scenario` (actions déclarées : clic, saisie, navigation) puis `export_environment_bundle` pour écrire le bundle AgentEnv ;
- puis reconstruction : on modifie les assets/sources récupérés (couleurs, sprites, sons) et on re-serve le site reconstruit.

Prérequis : un navigateur installé sur la machine hôte, accessible à l'environnement qui exécute REA.

---

## 7. Vérification finale avant la démo

```bash
rea doctor --json                    # enregistrement MCP général
rea doctor --provider ghidra --json  # provider Ghidra (partie 1)
rea doctor --provider jadx --json    # provider JADX (partie 2)
rea --version
```

Liste de contrôle :

- [ ] Node.js installé, `rea` disponible dans le PATH
- [ ] `rea setup` appliqué pour votre client, client redémarré, outils visibles
- [ ] Ghidra installé et détecté par `rea doctor --provider ghidra`
- [ ] Java 17+, JADX MCP JAR 0.7.1, `REA_JADX_MCP_JAR` exportée
- [ ] Navigateur disponible pour la capture web

---

## 8. Dépannage rapide

| Symptôme | Cause probable | Remède |
|---|---|---|
| Aucun outil `rea` dans la session | enregistrement MCP absent/stale | `rea doctor --client <id> --json` puis `rea setup` + redémarrage du client |
| Outils absents après setup OK | session pas reconnectée | redémarrer le client agent |
| `provider_unavailable` sur une opération | prérequis manquant (Ghidra/JADX/Java) | lire la remediation retournée ; `rea doctor --provider <nom>` |
| Premier appel Ghidra trop long | import + auto-analyse | `REA_GHIDRA_STARTUP_TIMEOUT_MS` ou `ghidra.startup_timeout_ms` |
| Connexion MCP qui tombe | incident réseau/IPC | réessayer une fois si sûr ; sinon redémarrer le client MCP |

Ne réinstallez rien pour réparer un rejet de politique d'approbation du client agent : c'est une décision côté client, pas un problème REA.
