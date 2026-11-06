#!/usr/bin/env bash
# holdout.sh — l'« examen surprise » de la démo 1.
#
# Génère un jeu de 500 cas NEUF à partir d'un seed choisi par la salle,
# l'interroge sur le binaire, puis note la reconstruction de l'agent.
# L'agent n'a jamais pu voir ces cas : ils n'existaient pas pendant son analyse.
#
# Usage :
#   ./holdout.sh <seed> [chemin/reimplementation.py]
#   ./holdout.sh 1789                                  # défaut : ~/rea-live/harness/reimplementation.py
#
# Les fichiers générés vont dans verdict/ (hors de l'arène de l'agent).
set -euo pipefail

SEED="${1:?usage: ./holdout.sh <seed> [impl.py]}"
KIT="$(cd "$(dirname "$0")" && pwd -P)"
IMPL="${2:-$HOME/rea-live/harness/reimplementation.py}"
# Les références privées sont à la racine du dépôt, hors de rea-live.
# Accepter .verity/... depuis le panneau B (01-blackbox) ou un autre dossier.
if [[ "$IMPL" == .verity/* ]] && [ ! -f "$IMPL" ]; then
  IMPL="$KIT/../$IMPL"
fi
OUT="$KIT/verdict"
mkdir -p "$OUT"

[ -f "$IMPL" ] || { echo "ERREUR : $IMPL introuvable"; exit 1; }

# Garde-fou : la reconstruction doit être du Python pur, pas un appel au binaire.
if grep -nE "^[^#]*(subprocess|os\.system|os\.popen|ctypes|cffi)" "$IMPL"; then
  echo "⚠️  la reconstruction appelle le binaire ou du code natif : le test ne prouverait rien."
  exit 3
fi

python3 "$KIT/harness/gen_cases.py" --n 500 --seed "$SEED" --out "$OUT/cases_$SEED.csv" >/dev/null
python3 "$KIT/harness/probe.py" --cases "$OUT/cases_$SEED.csv" \
        --binary "$KIT/oracle" --out "$OUT/holdout_$SEED.csv" >/dev/null

echo "examen surprise — seed $SEED — 500 cas jamais vus par l'agent"
echo
python3 "$KIT/harness/verify.py" --impl "$IMPL" --expected "$OUT/holdout_$SEED.csv"
