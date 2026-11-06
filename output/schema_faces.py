#!/usr/bin/env python3
"""Schéma — sous-système de reconnaissance faciale de Cozmo (style Code Academy 123)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle

NAVY   = "#0D1B2A"
PANEL  = "#1B2D42"
CREME  = "#F8F4EE"
GOLD   = "#C9A84C"
ORANGE = "#E8621A"
BRICK  = "#B3492F"
GRAYB  = "#D6DDE6"
INK    = "#333D49"
WHITE  = "#FFFFFF"

fig, ax = plt.subplots(figsize=(16, 9), dpi=120)
ax.set_xlim(0, 160); ax.set_ylim(0, 90)
ax.axis("off")
fig.patch.set_facecolor(CREME)

def box(x, y, w, h, fc, ec=None, lw=0):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.4,rounding_size=1.2",
                                fc=fc, ec=ec or fc, lw=lw, zorder=2))

def text(x, y, s, size=10, color=INK, weight="normal", ha="center", va="center", style="normal", family="DejaVu Sans"):
    ax.text(x, y, s, fontsize=size, color=color, fontweight=weight, ha=ha, va=va,
            style=style, family=family, zorder=5)

def arrow(x1, y1, x2, y2, color=NAVY, lw=2.2, style="-|>", ls="-"):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle=style, mutation_scale=16,
                                 color=color, lw=lw, linestyle=ls, zorder=4))

# ================= BANDEAU =================
ax.add_patch(Rectangle((0, 81), 160, 9, fc=NAVY, zorder=1))
ax.add_patch(Rectangle((0, 81), 1.6, 9, fc=GOLD, zorder=2))
text(5, 86.5, "Cozmo — la reconnaissance faciale, sous le capot", size=19, color=WHITE, weight="bold", ha="left", family="DejaVu Serif")
text(5, 83, "Omron OKAO FaceLib sur le robot  •  protocole CLAD  •  album de 10 visages  •  aucune photo stockée",
     size=10.5, color=GOLD, style="italic", ha="left")

# ================= COLONNE ROBOT =================
box(4, 8, 44, 68, PANEL)
text(26, 73, "ROBOT COZMO", size=12, color=GOLD, weight="bold")
text(26, 70.6, "caméra + processeur embarqué", size=8.5, color=GRAYB, style="italic")

box(7, 62, 38, 6.5, NAVY)
text(26, 65.9, "Caméra — flux vidéo continu", size=9.5, color=WHITE, weight="bold")
text(26, 63.6, "images basse résolution, traitées image par image", size=7.5, color=GRAYB)
arrow(26, 62, 26, 58.5, color=GOLD, lw=2.5)

box(7, 47.5, 38, 11, "#12253C", ec=GOLD, lw=1.6)
text(26, 56.4, "OMRON OKAO — FaceLib", size=11, color=GOLD, weight="bold")
text(26, 54.1, "détection + suivi du visage", size=8, color=WHITE)
text(26, 52.3, "repères : yeux • nez • bouche", size=8, color=GRAYB)
text(26, 50.5, "expression : 5 classes + scores", size=8, color=GRAYB)
text(26, 48.7, "regard • clignement • sourire", size=8, color=GRAYB)
arrow(26, 47.5, 26, 44, color=GOLD, lw=2.5)

box(7, 33, 38, 11, "#12253C", ec=GOLD, lw=1.6)
text(26, 41.9, "Album facial — 10 slots max", size=10.5, color=GOLD, weight="bold")
text(26, 39.6, "5 entrées multi-pose par personne", size=8, color=WHITE)
text(26, 37.8, "descripteurs entiers (pas de photos)", size=8, color=GRAYB)
text(26, 35.2, "comparaison visage détecté ↔ album", size=8.5, color=WHITE)
text(26, 33.9, "→ le nom arrive avec la piste", size=8, color=GRAYB)

box(7, 22.5, 38, 6.5, NAVY)
text(26, 26.4, "Moteur Cozmo (libcozmoEngine)", size=9.5, color=WHITE, weight="bold")
text(26, 24.1, "sérialise les événements CLAD binaires", size=7.5, color=GRAYB)
arrow(26, 22.5, 26, 19, color=GOLD, lw=2.5)

box(7, 11, 38, 8, NAVY)
text(26, 17.3, "WiFi direct robot ↔ tablette", size=9.5, color=WHITE, weight="bold")
text(26, 14.9, "2 pipes binaires P/Invoke", size=8, color=GRAYB)
text(26, 12.7, "engine → app  |  app → engine", size=8, color=GRAYB)

# ================= COLONNE APP =================
box(112, 8, 44, 68, PANEL)
text(134, 73, "APPLICATION (tablette)", size=12, color=GOLD, weight="bold")
text(134, 70.6, "Unity + C# — façade d'orchestration", size=8.5, color=GRAYB, style="italic")

box(115, 62, 38, 6.5, NAVY)
text(134, 65.9, "Écrans d'enrôlement", size=9.5, color=WHITE, weight="bold")
text(134, 63.6, "« regarde Cozmo » • prénom • erreur si plusieurs visages", size=6.8, color=GRAYB)
arrow(134, 62, 134, 58.5, color=GOLD, lw=2.5)

box(115, 47.5, 38, 11, "#12253C", ec=GOLD, lw=1.6)
text(134, 56.4, "Robot.cs — la façade", size=11, color=GOLD, weight="bold")
text(134, 54.1, "listes Faces + EnrolledFaces (id → nom)", size=8, color=WHITE)
text(134, 52.3, "suivi : éviction après 1 image perdue", size=8, color=GRAYB)
text(134, 50.5, "regard : TurnTowardsFace, animations", size=8, color=GRAYB)
text(134, 48.7, "nommé / inconnu → réactions différentes", size=8, color=GRAYB)
arrow(134, 47.5, 134, 44, color=GOLD, lw=2.5)

box(115, 33, 38, 11, "#12253C", ec=GOLD, lw=1.6)
text(134, 41.9, "Persistance", size=10.5, color=GOLD, weight="bold")
text(134, 39.6, "album sauvegardé sur le robot", size=8, color=WHITE)
text(134, 37.8, "enrollData.json côté app", size=8, color=GRAYB)
text(134, 35.6, "renommer / effacer un visage / tout effacer", size=8, color=GRAYB)
text(134, 33.9, "rechargé au démarrage (LoadedKnownFace)", size=8, color=GRAYB)

box(115, 22.5, 38, 6.5, NAVY)
text(134, 26.4, "Expérience", size=9.5, color=WHITE, weight="bold")
text(134, 24.1, "réticule caméra • Cozmo dit le prénom (TTS)", size=7.2, color=GRAYB)
arrow(134, 22.5, 134, 19, color=GOLD, lw=2.5)

box(115, 11, 38, 8, NAVY)
text(134, 17.3, "Code Lab / jeux", size=9.5, color=WHITE, weight="bold")
text(134, 14.9, "les mêmes événements alimentent les blocs", size=7.2, color=GRAYB)
text(134, 12.7, "« quand Cozmo voit un visage »…", size=8, color=GRAYB)

# ================= MESSAGERIE CENTRALE =================
box(55, 30, 50, 44, CREME, ec=GOLD, lw=2)
text(80, 71.5, "MESSAGES CLAD (binaires)", size=11.5, color=NAVY, weight="bold")
text(80, 69, "même protocole que le SDK Python — réimplémenté par PyCozmo", size=7.5, color=INK, style="italic")

box(57, 55, 46, 11.5, WHITE, ec=NAVY, lw=1.4)
text(80, 64.6, "ROBOT  →  APP", size=8.5, color=BRICK, weight="bold")
text(80, 62.6, "RobotObservedFace : piste, pose 3D, nom,", size=7.6, color=INK)
text(80, 60.9, "expression, sourire, regard, repères", size=7.6, color=INK)
text(80, 58.7, "FaceEnrollmentCompleted • LoadedKnownFace", size=7.6, color=INK)
text(80, 56.6, "RobotRenamed/ErasedEnrolledFace", size=7.6, color=INK)

box(57, 41.5, 46, 11.5, WHITE, ec=NAVY, lw=1.4)
text(80, 51.1, "APP  →  ROBOT", size=8.5, color=ORANGE, weight="bold")
text(80, 49.1, "SetFaceToEnroll : prénom, piste, saveToRobot,", size=7.6, color=INK)
text(80, 47.4, "sayName (TTS), useMusic", size=7.6, color=INK)
text(80, 45.2, "VisuallyVerifyFace • CancelFaceEnrollment", size=7.6, color=INK)
text(80, 43.1, "Update/EraseEnrolledFaceByID • EraseAll", size=7.6, color=INK)

box(57, 31.5, 46, 8.5, WHITE, ec=NAVY, lw=1.4)
text(80, 38.4, "CONSTANTES (FaceRecognitionConstants)", size=7.8, color=NAVY, weight="bold")
text(80, 36.4, "album : 10 personnes max  •  5 entrées / personne", size=7.6, color=INK)
text(80, 34.6, "prénom ≤ 255 octets  •  version d'album = 2", size=7.6, color=INK)

# flèches transverses
arrow(48.5, 60.5, 57, 60.5, color=BRICK, lw=2.4)
arrow(57, 47, 48.5, 47, color=ORANGE, lw=2.4)
text(52.7, 63, "flux continu", size=7, color=BRICK, style="italic", ha="center")
text(52.7, 44, "commandes", size=7, color=ORANGE, style="italic", ha="center")

# ================= POINT PRIVÉ =================
box(55, 13.5, 50, 13, GOLD)
text(80, 24.2, "VIE PRIVÉE BY DESIGN", size=10, color=NAVY, weight="bold")
text(80, 21.6, "l'album = des descripteurs entiers, jamais de photos", size=8, color=NAVY)
text(80, 19.7, "enrôlement déclenché par l'utilisateur, effaçable en entier", size=8, color=NAVY)
text(80, 17.6, "interropérable : protocole CLAD ouvert (PyCozmo)", size=8, color=NAVY)

# ================= PIED =================
text(80, 5.5, "Code Academy 123  •  reverse engineering éducatif  •  sources : APK 3.4.0 décompilé + libcozmoEngine.so",
    size=8, color="#55677B")

out = "/Users/royanne-marie/Documents_local/My_apps/REA/02-cozmo-apk/slides/schema-reconnaissance-faciale.png"
plt.savefig(out, facecolor=CREME, bbox_inches="tight", pad_inches=0.15)
print("OK", out)
