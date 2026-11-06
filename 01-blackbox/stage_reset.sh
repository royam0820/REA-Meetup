#!/usr/bin/env bash
# stage_reset.sh — prépare une arène propre pour rejouer la démo 1 devant du public.
#
# Le problème qu'il résout : la veille, l'agent a écrit harness/reimplementation.py.
# Le jour J, dans le même dossier, il peut le retrouver et le recopier — la démo
# ne prouve plus rien.
#
# Usage :
#   ./stage_reset.sh                 # KIT=ce dossier  LIVE=$HOME/rea-live
#   ./stage_reset.sh /chemin/kit /chemin/live
set -euo pipefail

KIT="${1:-$(cd "$(dirname "$0")" && pwd)}"
LIVE="${2:-$HOME/rea-live}"

[ -x "$KIT/oracle" ]   || { echo "ERREUR : $KIT/oracle introuvable (make ?)"; exit 1; }
[ -d "$KIT/harness" ]  || { echo "ERREUR : $KIT/harness introuvable";  exit 1; }

# --- 1. on met l'ancienne arène de côté (jamais de suppression sèche) -------
if [ -e "$LIVE" ]; then
  OLD="${LIVE}.old.$(date +%Y%m%d-%H%M%S)"
  mv "$LIVE" "$OLD"
  echo "ancienne arène déplacée -> $OLD"
fi
mkdir -p "$LIVE/blackbox" "$LIVE/harness"

# --- 2. on ne copie QUE ce que l'agent a le droit de voir -------------------
cp "$KIT/oracle" "$LIVE/blackbox/oracle"
chmod +x "$LIVE/blackbox/oracle"

# Pas de Makefile (il cite ../.verity/blackbox.c), pas de .md (le runbook
# contient la réponse : 0.0137 et la table), pas de .verity, pas de expected.csv.
for f in gen_cases.py probe.py verify.py naive.py cases.csv; do
  cp "$KIT/harness/$f" "$LIVE/harness/$f"
done

# --- 3. la vérité terrain reste HORS de l'arène -----------------------------
mkdir -p "$KIT/verdict"
if [ ! -s "$KIT/verdict/expected.csv" ]; then
  echo "génération de verdict/expected.csv..."
  ( cd "$KIT/harness" && python3 probe.py --cases cases.csv \
      --binary "$KIT/oracle" --out "$KIT/verdict/expected.csv" )
fi

# --- 4. contrôles -----------------------------------------------------------
echo
echo "--- arène : $LIVE ---"
find "$LIVE" -type f | sort
echo
echo "--- verdict (hors arène) : $KIT/verdict/expected.csv ---"
wc -l < "$KIT/verdict/expected.csv" | xargs echo "lignes :"

echo
if grep -rIl -e "0137" -e "kLut" -e "verity" -e "solution" "$LIVE" 2>/dev/null; then
  echo "⚠️  SPOILER détecté ci-dessus : ne montre pas cette arène."
  exit 2
else
  echo "OK — aucun spoiler dans l'arène (ni 0.0137, ni table, ni source)."
fi

echo
echo "Le jour J :"
echo "  cd $LIVE && claude          # session neuve, jamais --continue"
echo "  cd $LIVE/harness && python3 verify.py --impl reimplementation.py \\"
echo "      --expected $KIT/verdict/expected.csv"
