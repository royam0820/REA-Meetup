#!/usr/bin/env python3
"""Compose une scene du jeu Halloween Runner (600x170) avec les sprites du jeu."""
from PIL import Image
import sys, os

# importe bitmaps + palette depuis le generateur de sprites
sys.path.insert(0, '/Users/royanne-marie/Documents_local/My_apps/REA/04-halloween-demo/runner')
import importlib.util
spec = importlib.util.spec_from_file_location('art', '/Users/royanne-marie/Documents_local/My_apps/REA/04-halloween-demo/runner/art_preview.py')

# art_preview.py execute un rendu au import ; on recupere juste ses donnees
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)
PAL, render = art.PAL, art.render
SPRITES = dict(art.SPRITES)  # art_preview redefinit SPRITES en liste de tuples

W, H, GROUND_Y = 600, 170, 140
S_PLAYER, S_PROP, S_CLOUD = 8, 8, 8  # rendu directement en px ecran

def scaled(name, scale):
    img = render(SPRITES[name], 1)
    w = max(1, round(img.width * scale))
    h = max(1, round(img.height * scale))
    return img.resize((w, h), Image.NEAREST)

scene = Image.new('RGB', (W, H))
px = scene.load()
# ciel degrade jour
for y in range(H):
    t = y / H
    r = int(0xb8 + (0xd8 - 0xb8) * t)
    g = int(0xb8 + (0xd0 - 0xb8) * t)
    b = int(0xd8 + (0xc0 - 0xd8) * t)
    for x in range(W):
        px[x, y] = (r, g, b)

def paste(name, x, y, scale):
    img = scaled(name, scale)
    scene.paste(img, (x, y), img)

# nuages
paste('cloud', 60, 24, 1.4)
paste('cloud', 300, 48, 1.0)
paste('cloud', 470, 18, 1.4)

# sol : ligne + reliefs
for x in range(W):
    for dy in (0, 1):
        px[x, GROUND_Y + dy] = (106, 98, 87)
import random
random.seed(7)
x = 6
while x < W:
    h = random.randint(3, 7)
    for dx in range(3):
        for dy in range(h):
            px[x + dx, GROUND_Y - dy] = (106, 98, 87)
    px[x + 1, GROUND_Y + 2] = (106, 98, 87)
    px[x + 2, GROUND_Y + 3] = (106, 98, 87)
    x += random.randint(16, 44)

# citrouilles (sol)
pL = scaled('pumpkin_L', 1.5)
scene.paste(pL, (250, GROUND_Y - pL.height), pL)
pS = scaled('pumpkin_S', 1.5)
scene.paste(pS, (400, GROUND_Y - pS.height), pS)
scene.paste(pS, (430, GROUND_Y - pS.height), pS)

# chauve-souris
bat = scaled('bat_A', 1.5)
scene.paste(bat, (520, 62), bat)

# fantome (personnage, pieds au sol)
ghost = scaled('ghost_A', 1.6)
scene.paste(ghost, (30, GROUND_Y - ghost.height), ghost)

out = '/Users/royanne-marie/Documents_local/My_apps/REA/04-halloween-demo/slides/media/game_scene.png'
os.makedirs(os.path.dirname(out), exist_ok=True)
scene.save(out)
print('saved', out, scene.size)
