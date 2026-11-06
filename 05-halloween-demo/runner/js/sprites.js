/* Halloween Runner — sprites pixel art.
 * Chaque sprite est une grille de caracteres ; la palette est definie ci-dessous.
 * Portes depuis art_preview.py (validation visuelle PIL). */
'use strict';

const SPRITE_PALETTE = {
  E: '#665487', // contour du fantome
  H: '#fff2bc', // reflets chauds
  T: '#8d361d', // contour citrouille
  L: '#ffc060', // relief citrouille
  A: '#f6a6bd', // joues
  V: '#ad79dc', // membrane des ailes
  W: '#fffdf5', // corps fantome
  S: '#b8b9e5', // ombrage fantome
  K: '#1a1a2e', // yeux / sombre
  P: '#7b2fbf', // violet chapeau/robe sorciere
  Q: '#461973', // violet fonce (rebord chapeau)
  F: '#ffd9b3', // peau
  R: '#e2562b', // cheveux roux
  B: '#3e3060', // bottes / chauve-souris
  O: '#ff982c', // citrouille
  D: '#d65b22', // citrouille cotes
  G: '#608c30', // tige
  Y: '#ffe875', // lueur yeux citrouille / yeux chauve-souris
  C: '#e8e8f4', // nuage (jour)
  N: '#787896', // nuage (nuit)
  M: '#f4ecc8', // lune
};

const SPRITES = {
  ghost_A: [
    '......EEEEEEEEE.......',
    '....EEWWWWWWWWWEEE....',
    '...EWWWWWWWWWWWWWSE...',
    '..EWWWWWWWWWWWWWWSSE..',
    '.EWWWWWWWWWWWWWWWSSSE.',
    '.EWWWWWWWWWWWWWWWSSSE.',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWKKWWWWWWKKSSSSE',
    'EWWWWWKKKWWWWWKKKSSSSE',
    'EWWWWWKKKEWWWWKKKSSSSE',
    'EWWWAAWE.KEWKWWWWAASSE',
    'EWWWWWE...KKEWWWWSSSSE',
    'EWWWWWE.EEEE.EWWWSSSSE',
    'EWWWWWWEWWWWEWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    '.EWWWWWWWWWWWWWWWSSSE.',
    '.EWWWWWWWWWWWWWWWSSSE.',
    'ESSSESSSSESSSSESSSSSSE',
    'ESSE.ESSE.ESSE.EESSSSE',
    'ESE..ESSE..ESSE..EESSE',
    'EE...ESSE...ESSE...ESE',
    'E....EEE.....EE....EE.',
  ],
  ghost_B: [
    '......EEEEEEEEE.......',
    '....EEWWWWWWWWWEEE....',
    '...EWWWWWWWWWWWWWSE...',
    '..EWWWWWWWWWWWWWWSSE..',
    '.EWWWWWWWWWWWWWWWSSSE.',
    '.EWWWWWWWWWWWWWWWSSSE.',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWKKWWWWWWKKSSSSE',
    'EWWWWWKKKWWWWWKKKSSSSE',
    'EWWWWWKKKEWWWWKKKSSSSE',
    'EWWWAAWE.KEWKWWWWAASSE',
    'EWWWWWE...KKEWWWWSSSSE',
    'EWWWWWE.EEEE.EWWWSSSSE',
    'EWWWWWWEWWWWEWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    'EWWWWWWWWWWWWWWWWSSSSE',
    '.EWWWWWWWWWWWWWWWSSSE.',
    '.EWWWWWWWWWWWWWWWSSSE.',
    'ESSSEESSSSEESSSSEESSSE',
    'ESSE..ESSE..ESSE..ESSE',
    'ESE....ESE..ESE....ESE',
    'EE.....EE....EE.....EE',
    '......................',
  ],
  ghost_duck: [
    '......EEEEEEEEE.......',
    '....EEWWWWWWWWWEEE....',
    '..EEWWWWWWWWWWWWWSEE..',
    'EEWWWWWWWWWWWWWWWSSSEE',
    'EWWWWWWKKWWWWWWKKSSSSE',
    'EWWWWWKKKWWWWWKKKSSSSE',
    'EWWWWWKKKWWWWWKKKSSSSE',
    'EWWWAAWWWKWWKWWWWAASSE',
    'ESSSSSSSSSKKSSSSSSSSSE',
    '.ESSESSSSESSSSESSSSSE.',
    'ESSE.ESSE.EESE.EEEESSE',
    'ESE...ESSE..ESEE...ESE',
    'EE.....EE....EE.....EE',
  ],
  witch_A: [
    '..........PPPPP.......',
    '.........PPPPPPQ......',
    '.........PPQPPPQ......',
    '.........PPPPPP.......',
    '..........PPPP........',
    'QQQQQQQYYYYYYYYYQQQQQQ',
    '.RRRRFFFFFFFFFFFFRRRR.',
    'RRRRFFFFFFFFFFFFFFRRRR',
    'RRRRFFKFFFFKFFFFRRRRRR',
    'RRRRFFFFFFFFFFFFFFRRRR',
    '....FFFFFFFFFFFF......',
    '...VVVVVVPPPPPPQQQ....',
    '..VVVVVVVPPPPPPQQQQQ..',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    'VVVVVVVVVPPPPPPQQQQQQ.',
    'VVVVVVVVVPPPPPPQQQQQQ.',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '..VVVVVVVPPPPPPQQQQQ..',
    '....VVVVVPPPPPPQQQ....',
    '.....BB......BB.......',
    '.....BB......BB.......',
    '....BBB......BBB......',
    '....BB.......BB.......',
  ],
  witch_B: [
    '..........PPPPP.......',
    '.........PPPPPPQ......',
    '.........PPQPPPQ......',
    '.........PPPPPP.......',
    '..........PPPP........',
    'QQQQQQQYYYYYYYYYQQQQQQ',
    '.RRRRFFFFFFFFFFFFRRRR.',
    'RRRRFFFFFFFFFFFFFFRRRR',
    'RRRRFFKFFFFKFFFFRRRRRR',
    'RRRRFFFFFFFFFFFFFFRRRR',
    '....FFFFFFFFFFFF......',
    '...VVVVVVPPPPPPQQQ....',
    '..VVVVVVVPPPPPPQQQQQ..',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    'VVVVVVVVVPPPPPPQQQQQQ.',
    'VVVVVVVVVPPPPPPQQQQQQ.',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '..VVVVVVVPPPPPPQQQQQ..',
    '....VVVVVPPPPPPQQQ....',
    '.......BB..BB.........',
    '.......BB..BB.........',
    '......BB....BB........',
    '......BB.....BB.......',
  ],
  witch_duck: [
    '.........PPPPP........',
    '........VPPPPPP.......',
    '........VPQPPPP.......',
    '........VPPPPP........',
    '.........PPPP.........',
    'QQQQQQQYYYYYYYYYQQQQQQ',
    'RRRRFFKFFFFKFFFFRRRRR.',
    'RRRRFFFFFFFFFFFFFFRRRR',
    '....FFFFFFFFFFFF......',
    '..VVVVVVVPPPPPPQQQQQ..',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '.VVVVVVVVPPPPPPQQQQQQ.',
    '..VVVVVVVPPPPPPQQQQQ..',
    '.....BB........BB.....',
    '.....BB........BB.....',
    '....BBB........BBB....',
    '....BB..........BB....',
  ],
  pumpkin_S: [
    '..........GH........',
    '.........HGHG.......',
    '.........HG.........',
    '......TTTOOTTT......',
    '....TTDOLOOODOTT....',
    '...TOODOLOOODOLOT...',
    '..TOOODOLOOODOLODT..',
    '..TOOODOLOOODOLODT..',
    '.TLOOKDOLOOODKLODDTT',
    '.TLOOKKOLOOODKKODDDT',
    '.TLOOKYKLOOODKYKDDDT',
    '.TLOOODOLOOODOLODDDT',
    '.TLOOODOLOTODOLODDDT',
    '.TLOOODOLOOODOLODDDT',
    '.TLOOTTTTTTTTTTTDDDT',
    '.TLOOYTYYTYYTYYTDDDT',
    '.TLOOODTTTTTTTLODDDT',
    '.TLOOODOLOOODOLODDDT',
    '.TLOOODOLOOODOLODDDT',
    '..TOOODOLOOODOLODDT.',
    '..TOOODOLOOODOLODTT.',
    '...TDDDDDDDDDDDDT...',
    '....TTDDDDDDDDTT....',
    '......TTTTTTTT......',
  ],
  pumpkin_L: [
    '...........HGH...........',
    '..........GHGHG..........',
    '..........GHGH...........',
    '.........HGH.............',
    '........GH...............',
    '....TTTTLOTTTTTTTTT......',
    '..TTOODOLOOODOLOOODTT....',
    '.TLOOODOLOOODOLOOODOLTT..',
    '.TLOOODOLOOODOLOOODOLT...',
    'TOLOOODOLOOODOLOOODOLDT..',
    'TOLOOODKLOOODOLKOODOLDT..',
    'TOLOOODKKOOODOLKKODOLDT..',
    'TOLOOODKYKOODOLKYKDOLDT..',
    'TOLOOODOLOOODOLOOODOLDT..',
    'TOLOOODOLOOOTOLOOODOLDT..',
    'TOLOOODOLOOODOLOOODOLDT..',
    'TOLOOODTTTTTTTTTTTDOLDT..',
    'TOLOOODYYTYYTYYTYYDOLDT..',
    'TOLOOODOLTTTTTTTOODOLDT..',
    'TOLOOODOLOOODOLOOODOLT...',
    'TOLOOODOLOOODOLOOODOLT...',
    'TOLOOODOLOOODOLOOODOLT...',
    'TOLOOODOLOOODOLOOODOLT...',
    'TOLOOODOLOOODOLOOODOT....',
    '.TLOOODOLOOODOLOOODOT....',
    '.TLOOODOLOOODOLOOODT.....',
    '..TDDDDDDDDDDDDDDDT......',
    '...TDDDDDDDDDDDDDTT......',
    '....TTTTTTTTTTTTT........',
  ],
  bat_A: [
    '.KK.................KK.',
    '.KVK...KK......KK..KVK.',
    '.KVVK.KVK..KK..KVK.KVVK',
    '..KVVKVVK.KBBK.KVVK.KVK',
    '..KVVVVVK.KBBBK.KVVK.KK',
    '...KVVVVK.KYBKYKKVVVKK.',
    '....KVVVK.KBBBKK.KVVVK.',
    '.....KVVK.KBBBBK.KVVK..',
    '......KVK.KBBBBK.KVK...',
    '.......KK..KBBK..KK....',
    '........K...KK...K.....',
  ],
  bat_B: [
    '........................',
    '..........KK..KK........',
    '.........KBK..KBK.......',
    '..........KK..KK........',
    '..KK......KYKKYK......KK',
    '.KVK......KBBBBK.....KVK',
    '.KVVK....KBKBBBBK....KVK',
    '..KVVK..KBK.KBBK.KKK.KVK',
    '...KVVK.KK..KBBK..KK.KK.',
    '....KVVKK...KBBK...KKK..',
    '.....KVK....KKKK....KK..',
    '.....KK.................',
  ],
  cloud: [
    '........CCCCCC..........',
    '.....CCCCCCCCCCCC.......',
    '..CCCCCCCCCCCCCCCCCC....',
    'CCCCCCCCCCCCCCCCCCCCCC..',
    'CCCCCCCCCCCCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCCCCCCCCCC..',
  ],
  moon: [
    '....MMMMMMMM....',
    '..MMMMMMMMMMMM..',
    '.MMMMMMMMMMMMMM.',
    'MMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMMMM',
    '.MMMMMMMMMMMMMM.',
    '..MMMMMMMMMMMM..',
    '....MMMMMMMM....',
  ],
};

/* Rend un bitmap en canvas offscreen (un pixel art = un pixel). */
function renderSprite(rows, override) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = (override && override[ch]) || SPRITE_PALETTE[ch];
      if (!color) continue;
      g.fillStyle = color;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}
