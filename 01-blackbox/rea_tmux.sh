#!/usr/bin/env bash
# rea_tmux.sh — scène de la démo 1 : deux panneaux côte à côte, colorés et titrés.
#   gauche (bleu) : A - AGENT, dans ~/rea-live   -> on y lance `claude`
#   droite (vert) : B - MOI,   dans 01-blackbox   -> verify / holdout / dévoilement
# Usage : ./rea_tmux.sh               (relancer = se rattacher à la session)
#         tmux kill-session -t rea    (pour repartir de zéro)
set -euo pipefail
S=rea
LIVE="$HOME/rea-live"
KIT="$(cd "$(dirname "$0")" && pwd -P)"

command -v tmux >/dev/null || { echo "ERREUR : tmux introuvable" >&2; exit 1; }
[ -x "$LIVE/blackbox/oracle" ] || {
  echo "ERREUR : $LIVE/blackbox/oracle introuvable. Lancez $KIT/stage_reset.sh." >&2
  exit 1
}

# Même commande ./blackbox/oracle dans les deux panneaux. Le lien suit
# toujours l'arène courante, même après un stage_reset.sh.
if [ -L "$KIT/blackbox" ]; then
  if [ "$(readlink "$KIT/blackbox")" != "$LIVE/blackbox" ]; then
    ln -sfn "$LIVE/blackbox" "$KIT/blackbox"
  fi
elif [ ! -e "$KIT/blackbox" ]; then
  ln -s "$LIVE/blackbox" "$KIT/blackbox"
else
  echo "ERREUR : $KIT/blackbox existe déjà et n'est pas un lien symbolique." >&2
  exit 1
fi

if ! tmux has-session -t "$S" 2>/dev/null; then
  tmux new-session -d -s "$S" -n demo -c "$LIVE" -x 200 -y 50
  tmux split-window -h -t "$S:demo" -c "$KIT" -l 40%

  tmux set -t "$S" mouse on
  tmux set -t "$S" status off
  tmux set -t "$S" pane-border-status top
  tmux set -t "$S" pane-border-format " #{pane_title} "
  tmux set -t "$S" pane-border-lines heavy
  tmux set -t "$S" pane-active-border-style "fg=yellow,bold"
  tmux set -t "$S" pane-border-style "fg=colour244"

  tmux select-pane -t "$S:demo.0" -T "A - AGENT  (rea-live)" -P "bg=#0b2545"
  tmux select-pane -t "$S:demo.1" -T "B - MOI  (01-blackbox)"   -P "bg=#0f3d2e"
  tmux select-pane -t "$S:demo.0"
fi

# Rafraîchir les titres à chaque lancement, même pour une session existante.
tmux select-pane -t "$S:demo.0" -T "A - AGENT  (rea-live)"
tmux select-pane -t "$S:demo.1" -T "B - MOI  (kit : ./oracle ou ./blackbox/oracle)"

# Si l'arène a été recréée par stage_reset.sh (ancien chemin .old ou nouvel inode),
# on relance proprement le panneau A dans le nouveau $LIVE.
AGENT_PATH="$(tmux display-message -p -t "$S:demo.0" '#{pane_current_path}')"
PANE_PID="$(tmux display-message -p -t "$S:demo.0" '#{pane_pid}')"
PANE_INODE="$(lsof -a -p "$PANE_PID" -d cwd -Fi 2>/dev/null | sed -n 's/^i//p' || true)"
TARGET_INODE="$(stat -f '%i' "$AGENT_PATH" 2>/dev/null || true)"

if [[ "$AGENT_PATH" != "$LIVE" && "$AGENT_PATH" != "$LIVE/"* ]] \
   || [ -z "$TARGET_INODE" ] \
   || [ "$PANE_INODE" != "$TARGET_INODE" ]; then
  tmux respawn-pane -k -t "$S:demo.0" -c "$LIVE"
  tmux select-pane -t "$S:demo.0" -T "A - AGENT  (rea-live)" -P "bg=#0b2545"
fi

# --- Copier / coller facile (appliqué à chaque lancement, même si la session existe) ---
# Sélection à la souris -> copiée directement dans le presse-papiers macOS (pbcopy).
#   glisser = sélection | double-clic = mot | triple-clic = ligne
# Collage : Cmd+V (normal) ou clic molette. Le texte reste dans le panneau cliqué.
tmux set -s set-clipboard on
tmux set -t "$S" mode-keys vi
for T in copy-mode copy-mode-vi; do
  tmux bind-key -T "$T" MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel "pbcopy"
  tmux bind-key -T "$T" DoubleClick1Pane  select-pane \\\; send-keys -X select-word \\\; send-keys -X copy-pipe-and-cancel "pbcopy"
  tmux bind-key -T "$T" TripleClick1Pane  select-pane \\\; send-keys -X select-line \\\; send-keys -X copy-pipe-and-cancel "pbcopy"
done
# Double/triple-clic hors mode copie : entre en mode copie puis sélectionne
tmux bind-key -n DoubleClick1Pane select-pane \\\; copy-mode -H \\\; send-keys -X select-word \\\; send-keys -X copy-pipe-and-cancel "pbcopy"
tmux bind-key -n TripleClick1Pane select-pane \\\; copy-mode -H \\\; send-keys -X select-line \\\; send-keys -X copy-pipe-and-cancel "pbcopy"
# Clic molette = coller depuis le presse-papiers macOS
tmux bind-key -n MouseDown2Pane run-shell 'pbpaste | tmux load-buffer - && tmux paste-buffer -p'

exec tmux attach -t "$S"
