#!/usr/bin/env python3
"""Preview des sprites pixel art pour Halloween Runner.
Les bitmaps definis ici seront portes tels quels dans sprites.js."""
from PIL import Image, ImageDraw

PAL = {
    'W': (245, 245, 255),  # corps fantome
    'S': (206, 206, 232),  # ombrage fantome
    'K': (26, 26, 46),     # yeux / sombre
    'P': (123, 47, 191),   # violet chapeau/robe sorciere
    'Q': (70, 25, 115),    # violet fonce (rebord chapeau)
    'F': (255, 217, 179),  # peau
    'R': (226, 86, 43),    # cheveux roux
    'B': (62, 48, 96),     # bottes / chauve-souris
    'O': (255, 140, 26),   # citrouille
    'D': (224, 106, 0),    # citrouille cotes
    'G': (96, 140, 48),    # tige
    'Y': (255, 210, 63),   # lueur yeux citrouille / yeux chauve-souris
    'C': (232, 232, 244),  # nuage
    'N': (120, 120, 150),  # nuage nuit
    'M': (244, 236, 200),  # lune
}

def render(rows, scale=8):
    h, w = len(rows), len(rows[0])
    img = Image.new('RGBA', (w * scale, h * scale), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in PAL:
                for dy in range(scale):
                    for dx in range(scale):
                        px[x * scale + dx, y * scale + dy] = (*PAL[ch], 255)
    return img

# ---------------- FANTOME, 2 frames flottantes + posture baissee -------------
GHOST_A = [
    "......WWWWWWWWW.......",
    "....WWWWWWWWWWWWWW....",
    "...WWWWWWWWWWWWWWWW...",
    "..WWWWWWWWWWWWWWWWWW..",
    ".WWWWWWWWWWWWWWWWWWWW.",
    ".WWWWWWWWWWWWWWWWWWWW.",
    "WWWWKWWKWWWWKWWKWWWWWW",
    "WWWWKWWKWWWWKWWKWWWWWW",
    "WWWWKWWKWWWWKWWKWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWKS..SKWWWWWWWWWW",
    "WWWWWWK....KWWWWWWWWWW",
    "WWWWWWK.KKKK.KWWWWWWWW",
    "WWWWWWWKKKKKKWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    ".WWWWWWWWWWWWWWWWWWWW.",
    ".WWWWWWWWWWWWWWWWWWWW.",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWW.WWWW.WWWW.WWWWWWW",
    "WWW..WWWW..WWWW..WWWWW",
    "WW...WWWW...WWWW...WWW",
    "W....WWW.....WW....WW.",
]
GHOST_B = GHOST_A[:21] + [
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWW..WWWW..WWWW..WWWW",
    "WWW....WWW..WWW....WWW",
    "WW.....WW....WW.....WW",
    "......................",
]
GHOST_DUCK = [
    "......WWWWWWWWW.......",
    "....WWWWWWWWWWWWWW....",
    "..WWWWWWWWWWWWWWWWWW..",
    "WWWWKWWKWWWWWWKWWKWWWW",
    "WWWWKWWKWWWWWWKWWKWWWW",
    "WWWWWWWKKKKKKWWWWWWWWW",
    "WWWWWWWKKKKKKWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    "WWWWWWWWWWWWWWWWWWWWWW",
    ".WWWWWWWWWWWWWWWWWWWW.",
    "WWWW.WWWW.WWWW.WWWWWWW",
    "WWW...WWWW..WWWW...WWW",
    "WW.....WW....WW.....WW",
]

# ---------------- SORCIERE, 2 frames de course + posture baissee -------------
WITCH_A = [
    "..........PPPPP.......",
    ".........PPPPPPP......",
    ".........PPQPPPP......",
    ".........PPPPPP.......",
    "..........PPPP........",
    "QQQQQQQQQQQQQQQQQQQQQQ",
    ".RRRRFFFFFFFFFFFFRRRR.",
    "RRRRFFFFFFFFFFFFFFRRRR",
    "RRRRFFKFFFFKFFFFRRRRRR",
    "RRRRFFFFFFFFFFFFFFRRRR",
    "....FFFFFFFFFFFF......",
    "...PPPPPPPPPPPPPPP....",
    "..PPPPPPPPPPPPPPPPPP..",
    ".PPPPPPPPPPPPPPPPPPPP.",
    ".PPPPPPPPPPPPPPPPPPPP.",
    "PPPPPPPPPPPPPPPPPPPPP.",
    "PPPPPPPPPPPPPPPPPPPPP.",
    ".PPPPPPPPPPPPPPPPPPPP.",
    "..PPPPPPPPPPPPPPPPPP..",
    "....PPPPPPPPPPPPPP....",
    ".....BB......BB.......",
    ".....BB......BB.......",
    "....BBB......BBB......",
    "....BB.......BB.......",
]
WITCH_B = [
    "..........PPPPP.......",
    ".........PPPPPPP......",
    ".........PPQPPPP......",
    ".........PPPPPP.......",
    "..........PPPP........",
    "QQQQQQQQQQQQQQQQQQQQQQ",
    ".RRRRFFFFFFFFFFFFRRRR.",
    "RRRRFFFFFFFFFFFFFFRRRR",
    "RRRRFFKFFFFKFFFFRRRRRR",
    "RRRRFFFFFFFFFFFFFFRRRR",
    "....FFFFFFFFFFFF......",
    "...PPPPPPPPPPPPPPP....",
    "..PPPPPPPPPPPPPPPPPP..",
    ".PPPPPPPPPPPPPPPPPPPP.",
    ".PPPPPPPPPPPPPPPPPPPP.",
    "PPPPPPPPPPPPPPPPPPPPP.",
    "PPPPPPPPPPPPPPPPPPPPP.",
    ".PPPPPPPPPPPPPPPPPPPP.",
    "..PPPPPPPPPPPPPPPPPP..",
    "....PPPPPPPPPPPPPP....",
    ".......BB..BB.........",
    ".......BB..BB.........",
    "......BB....BB........",
    "......BB.....BB.......",
]
WITCH_DUCK = [
    ".........PPPPP........",
    "........PPPPPPP.......",
    "........PPQPPPP.......",
    "........PPPPPP........",
    ".........PPPP.........",
    "QQQQQQQQQQQQQQQQQQQQQQ",
    "RRRRFFKFFFFKFFFFRRRRR.",
    "RRRRFFFFFFFFFFFFFFRRRR",
    "....FFFFFFFFFFFF......",
    "..PPPPPPPPPPPPPPPPPP..",
    ".PPPPPPPPPPPPPPPPPPPP.",
    ".PPPPPPPPPPPPPPPPPPPP.",
    "..PPPPPPPPPPPPPPPPPP..",
    ".....BB........BB.....",
    ".....BB........BB.....",
    "....BBB........BBB....",
    "....BB..........BB....",
]

# ---------------- CITROUILLES ------------------------------------------------
PUMPKIN_S = [  # petite
    "..........GG........",
    ".........GGGG.......",
    ".........GG.........",
    "......OOOOOOOO......",
    "....OOOOOOOOOOOO....",
    "...OOOOOOOOOOOOOO...",
    "..OOOOODOOOOODOOOO..",
    "..OOOODDOOOODDOOOO..",
    ".OOOOODDOOOOODDOOOOO",
    ".OOOOOOOOOOOOOOOOOOO",
    ".OOOOOOYYYYYOOOOOOOO",
    ".OOOOOYYKKKYYOOOOOOO",
    ".OOOOOYKKKKKYOOOOOOO",
    ".OOOOOYYKKKYYOOOOOOO",
    ".OOOOOOYYYYYOOOOOOOO",
    ".OOOOOOOOOOKOOOOOOOO",
    ".OOOOOOOOOOKKOOOOOOO",
    ".OOOOOOOOOOKOOOOOOOO",
    ".OOOOOOOOOOOOOOOOOOO",
    "..OOOOOOOOOOOOOOOOO.",
    "..OOOOOOOOOOOOOOOOO.",
    "...OOOOOOOOOOOOOO...",
    "....OOOOOOOOOOOO....",
    "......OOOOOOOO......",
]
PUMPKIN_L = [  # grosse
    "...........GGG..........",
    "..........GGGGG.........",
    "..........GGGG..........",
    ".........GGG............",
    "........GG..............",
    "....OOOOOOOOOOOOOOO.....",
    "..OOOOOOOOOOOOOOOOOOO...",
    ".OOOOOOOOOOOOOOOOOOOOOO..",
    ".OOOOOOODOOOOOOODOOOOO..",
    "OOOOOOODDOOOOOOODDOOOOO.",
    "OOOOOOODDOOOOOOODDOOOOO.",
    "OOOOOOOYYOOOOOOYYOOOOOO.",
    "OOOOOOOYYYOOOOYYYOOOOOO.",
    "OOOOOOOYYYKOOYKYYOOOOOO.",
    "OOOOOOOOYYKKKKYYOOOOOOO.",
    "OOOOOOOOYYKKKKYYOOOOOOO.",
    "OOOOOOOOYYYKOOYKYYOOOOO.",
    "OOOOOOOOYYYYOOYYYYOOOOO.",
    "OOOOOOOOOOOOOOKKOOOOOOO.",
    "OOOOOOOOOOOOKKKKOOOOOO.",
    "OOOOOOOOOOOOKKKKOOOOOO.",
    "OOOOOOOOOOOOOOKKOOOOOO.",
    "OOOOOOOOOOOOOOOOOOOOOO.",
    "OOOOOOOOOOOOOOOOOOOOO.",
    ".OOOOOOOOOOOOOOOOOOOO.",
    ".OOOOOOOOOOOOOOOOOOO..",
    "..OOOOOOOOOOOOOOOOO...",
    "...OOOOOOOOOOOOOOOO...",
    "....OOOOOOOOOOOOO.....",
]

# ---------------- CHAUVE-SOURIS, 2 frames ------------------------------------
BAT_A = [
    ".BB.................BB.",
    ".BBB...BB......BB..BBB.",
    ".BBBB.BBB..BB..BBB.BBBB",
    "..BBBBBBB.BBBB.BBBB.BBB",
    "..BBBBBBB.BKBBK.BBBB.BB",
    "...BBBBBB.BBBB.BBBBBBB.",
    "....BBBBB.BBYYBB.BBBBB.",
    ".....BBBB.BBBBBB.BBBB..",
    "......BBB.BBYYBB.BBB...",
    ".......BB..BBBB..BB....",
    "........B...BB...B.....",
]
BAT_B = [
    ".......................",
    "..........BB..BB.......",
    ".........BBB..BBB......",
    "..........BB..BB.......",
    "..BB......BBYYBB......BB",
    ".BBB......BBYYBB.....BBB",
    ".BBBB....BBBBBBBB....BBB",
    "..BBBB..BBB.BBBB.BBB.BBB",
    "...BBBB.BB..BBBB..BB.BB.",
    "....BBBBB...BBBB...BBB..",
    ".....BBB....BBBB....BB..",
    ".....BB................",
]

CLOUD = [
    "........CCCCCC..........",
    ".....CCCCCCCCCCCC.......",
    "..CCCCCCCCCCCCCCCCCC....",
    "CCCCCCCCCCCCCCCCCCCCCC..",
    "CCCCCCCCCCCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCCCCCCCCC..",
]
MOON = [
    "....MMMMMMMM....",
    "..MMMMMMMMMMMM..",
    ".MMMMMMMMMMMMMM.",
    "MMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMM",
    "MMMMMMMMMMMMMMMM",
    ".MMMMMMMMMMMMMM.",
    "..MMMMMMMMMMMM..",
    "....MMMMMMMM....",
]

SPRITES = [
    ("ghost_A", GHOST_A), ("ghost_B", GHOST_B), ("ghost_duck", GHOST_DUCK),
    ("witch_A", WITCH_A), ("witch_B", WITCH_B), ("witch_duck", WITCH_DUCK),
    ("pumpkin_S", PUMPKIN_S), ("pumpkin_L", PUMPKIN_L),
    ("bat_A", BAT_A), ("bat_B", BAT_B),
    ("cloud", CLOUD), ("moon", MOON),
]
for name, rows in SPRITES:
    w = max(len(r) for r in rows)
    rows[:] = [r.ljust(w, '.') for r in rows]

S, PAD = 8, 16
imgs = [(n, render(r, S)) for n, r in SPRITES]
W = max(i.width for _, i in imgs) + PAD * 2
H = sum(i.height + 30 for _, i in imgs) + PAD
sheet = Image.new('RGB', (W, H), (98, 96, 128))
d = ImageDraw.Draw(sheet)
y = PAD
for name, img in imgs:
    d.text((PAD, y), name, fill=(255, 255, 255))
    sheet.paste(img, (PAD, y + 22), img)
    y += img.height + 30
out = '/Users/royanne-marie/Documents_local/My_apps/REA/04-halloween-demo/runner/sprites_preview.png'
sheet.save(out)
print('saved', out, sheet.size)
