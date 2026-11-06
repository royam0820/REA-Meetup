/* Halloween Runner — moteur de jeu.
 * Recreation du Chrome Dino Game (T-Rex Runner) apres reverse engineering
 * statique REA de dinosaur.game (chunk 809.js, constantes Chromium lisibles :
 * GRAVITY, INITIAL_JUMP_VELOCITY, MIN_JUMP_HEIGHT, SPEED_DROP_COEFFICIENT...).
 *
 * Unites : pixels et frames a 60 fps (pas de temps fixe).
 */
'use strict';

(() => {
  // ---------------- Constantes (calquees sur le Runner original) -------------
  const CFG = {
    GRAVITY: 0.5,
    INITIAL_JUMP_VELOCITY: 11,
    MIN_JUMP_HEIGHT: 35,        // hauteur min. avant de pouvoir couper le saut
    SPEED_DROP_COEFFICIENT: 3,  // acceleration de la chute quand on baisse
    FLOAT_GRAVITY_COEFF: 0.22,  // flottement : gravitee reduite si espace maintenu en l'air
    INIT_SPEED: 6,              // px / frame
    MAX_SPEED: 13,
    ACCELERATION: 0.001,        // gain de vitesse / frame
    GAP_COEFFICIENT: 0.6,       // ecart entre obstacles
    MIN_GAP_PX: 130,
    START_GAP_PX: 500,        // debut : davantage de temps entre deux sauts
    INTRO_SCORE: 300,         // retour progressif au rythme normal
    MAX_GAP_PX: 620,
    SCORE_PER_PIXEL: 0.03,
    NIGHT_EVERY: 700,           // bascule jour/nuit tous les 700 points
    GROUND_Y: 140,
    PLAYER_X: 30,
    W: 600,
    H: 170,
  };
  const STEP_MS = 1000 / 60;

  // ---------------- DOM ------------------------------------------------------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = CFG.W * dpr;
  canvas.height = CFG.H * dpr;
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  const scoreEl = document.getElementById('score');
  const hiEl = document.getElementById('hiscore');
  const gameOverEl = document.getElementById('gameover');
  const finalScoreEl = document.getElementById('final-score');
  const bestScoreEl = document.getElementById('best-score');
  const restartBtn = document.getElementById('restart');
  const charBtns = Array.from(document.querySelectorAll('.char-btn'));
  const soundBtn = document.getElementById('sound');

  // ---------------- Sprites ------------------------------------------------
  const IMG = {};
  for (const [name, rows] of Object.entries(SPRITES)) IMG[name] = renderSprite(rows);

  // Echelles : le personnage fait ~42 px de haut (art 26 px -> x1.6)
  const SCALE_PLAYER = 1.6;
  const SCALE_PROP = 1.5;

  const CHARACTERS = {
    ghost: { run: ['ghost_A', 'ghost_B'], duck: ['ghost_duck'], bob: 0.5 },
    witch: { run: ['witch_A', 'witch_B'], duck: ['witch_duck'], bob: 0 },
  };

  // ---------------- Audio ----------------------------------------------------
  const SFX = {
    ctx: null,
    muted: localStorage.getItem('hr-muted') === '1',
    ensure() {
      if (!this.ctx) {
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { this.ctx = null; }
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    tone(type, f0, f1, dur, vol) {
      if (this.muted) return;
      const ac = this.ensure();
      if (!ac) return;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(f1, ac.currentTime + dur);
      g.gain.setValueAtTime(vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination);
      o.start();
      o.stop(ac.currentTime + dur);
    },
    jump() { this.tone('square', 420, 840, 0.12, 0.08); },
    hit() { this.tone('sawtooth', 220, 40, 0.35, 0.14); },
    milestone() {
      this.tone('sine', 880, 880, 0.07, 0.07);
      setTimeout(() => this.tone('sine', 1320, 1320, 0.09, 0.07), 90);
    },
  };

  function syncSoundBtn() {
    soundBtn.textContent = SFX.muted ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-label', SFX.muted ? 'Activer le son' : 'Couper le son');
  }
  syncSoundBtn();

  // ---------------- Etat -----------------------------------------------------
  let state = 'WAITING'; // WAITING | RUNNING | CRASHED
  let character = localStorage.getItem('hr-character') || 'ghost';
  if (!CHARACTERS[character]) character = 'ghost';
  let speed = CFG.INIT_SPEED;
  let score = 0;
  let hiscore = parseInt(localStorage.getItem('hr-hiscore') || '0', 10);
  let nextMilestone = 100;
  let frameCount = 0;      // compteur global (animations)
  let distSinceSpawn = 0;
  let nextGap = CFG.START_GAP_PX;
  let night = false;

  const player = {
    y: 0,        // hauteur au-dessus du sol (px)
    vy: 0,       // vitesse verticale (px/frame, negative = monte)
    ducking: false,
    jumpHeld: false,
    jumpTime: 0,
    anim: 0,
  };

  let obstacles = [];   // groupes : { pieces:[{img,x,y,w,h}], x, width }
  let clouds = [];
  let stars = [];
  let groundBumps = [];

  // ---------------- Deco initiale -------------------------------------------
  function initScenery() {
    clouds = [];
    for (let i = 0; i < 3; i++) {
      clouds.push({ x: Math.random() * CFG.W, y: 12 + Math.random() * 40, drift: 0.35 + Math.random() * 0.25 });
    }
    stars = [];
    for (let i = 0; i < 28; i++) {
      stars.push({ x: Math.random() * CFG.W, y: Math.random() * 90, p: Math.random() * Math.PI * 2 });
    }
    groundBumps = [];
    for (let x = 0; x < CFG.W + 40; x += 14 + Math.floor(Math.random() * 30)) {
      groundBumps.push({ x, h: 3 + Math.floor(Math.random() * 5) });
    }
  }
  initScenery();

  // ---------------- Outils ---------------------------------------------------
  const rand = (a, b) => a + Math.random() * (b - a);
  const spriteW = (img, s) => img.width * s;
  const spriteH = (img, s) => img.height * s;

  // ---------------- Obstacles ------------------------------------------------
  function makePumpkinGroup(large) {
    const name = large ? 'pumpkin_L' : 'pumpkin_S';
    const count = large ? (Math.random() < 0.45 ? 2 : 1) : 1 + Math.floor(Math.random() * 3);
    const pieces = [];
    let offset = 0;
    for (let i = 0; i < count; i++) {
      const w = spriteW(IMG[name], SCALE_PROP);
      const h = spriteH(IMG[name], SCALE_PROP);
      pieces.push({ img: IMG[name], x: offset, y: CFG.GROUND_Y - h, w, h });
      offset += Math.round(w * 0.72);
    }
    return { pieces, width: offset - Math.round(spriteW(IMG[name], SCALE_PROP) * 0.28) };
  }

  function makeBatGroup() {
    // 3 altitudes : bas (sauter), milieu (baisser), haut (libre)
    const altitudes = [52, 78, 104];
    const y = altitudes[Math.floor(Math.random() * altitudes.length)];
    const w = spriteW(IMG.bat_A, SCALE_PROP);
    const h = spriteH(IMG.bat_A, SCALE_PROP);
    return {
      pieces: [{ img: IMG.bat_A, alt: true, x: 0, y: CFG.GROUND_Y - y - h, w, h }],
      width: w,
      batY: CFG.GROUND_Y - y - h,
    };
  }

  function spawnObstacle() {
    const allowBats = speed >= 8; // comme le Runner original (ptérodactyle)
    let group;
    if (allowBats && Math.random() < 0.3) group = makeBatGroup();
    else group = makePumpkinGroup(Math.random() < 0.35);
    group.x = CFG.W + 20;
    obstacles.push(group);
    distSinceSpawn = 0;
    const normalGap = Math.max(
      speed * 60 * CFG.GAP_COEFFICIENT * rand(0.85, 1.35), CFG.MIN_GAP_PX
    );
    // Espacer les groupes au debut, puis reduire doucement cette aide.
    const introProgress = Math.min(score / CFG.INTRO_SCORE, 1);
    nextGap = Math.min(
      CFG.START_GAP_PX * (1 - introProgress) + normalGap * introProgress,
      CFG.MAX_GAP_PX
    );
  }

  function updateObstacles() {
    for (const g of obstacles) g.x -= speed;
    obstacles = obstacles.filter((g) => g.x + g.width > -40);

    const last = obstacles[obstacles.length - 1];
    const lastClear = !last || last.x + last.width < CFG.W;
    distSinceSpawn += speed;
    if (lastClear && distSinceSpawn >= nextGap) spawnObstacle();
  }

  // ---------------- Collision --------------------------------------------------
  function playerBox() {
    const ch = CHARACTERS[character];
    const img = IMG[player.ducking ? ch.duck[0] : ch.run[0]];
    const w = spriteW(img, SCALE_PLAYER);
    const h = spriteH(img, SCALE_PLAYER);
    const feetY = CFG.GROUND_Y - player.y;
    return {
      x: CFG.PLAYER_X + w * 0.22,
      y: feetY - h + 4,
      w: w * 0.56,
      h: h - 6,
    };
  }

  function pieceBox(piece, group) {
    const x = group.x + piece.x;
    if (piece.alt) {
      // chauve-souris : boite serree sur le corps, pas les ailes
      return { x: x + piece.w * 0.34, y: piece.y + 3, w: piece.w * 0.32, h: piece.h - 6 };
    }
    // citrouille : leger retrait
    return { x: x + piece.w * 0.12, y: piece.y + piece.h * 0.08, w: piece.w * 0.76, h: piece.h * 0.92 };
  }

  function hits() {
    const pb = playerBox();
    for (const g of obstacles) {
      for (const p of g.pieces) {
        const b = pieceBox(p, g);
        if (pb.x < b.x + b.w && pb.x + pb.w > b.x && pb.y < b.y + b.h && pb.y + pb.h > b.y) {
          return true;
        }
      }
    }
    return false;
  }

  // ---------------- Cycle de vie ------------------------------------------------
  function reset() {
    speed = CFG.INIT_SPEED;
    score = 0;
    nextMilestone = 100;
    obstacles = [];
    distSinceSpawn = 0;
    nextGap = CFG.START_GAP_PX;
    player.y = 0;
    player.vy = 0;
    player.ducking = false;
    player.jumpTime = 0;
    gameOverEl.classList.remove('visible');
  }

  function startGame() {
    reset();
    state = 'RUNNING';
    SFX.ensure();
  }

  function gameOver() {
    state = 'CRASHED';
    SFX.hit();
    const final = Math.floor(score);
    if (final > hiscore) {
      hiscore = final;
      localStorage.setItem('hr-hiscore', String(hiscore));
    }
    finalScoreEl.textContent = String(final).padStart(5, '0');
    bestScoreEl.textContent = String(hiscore).padStart(5, '0');
    gameOverEl.classList.add('visible');
  }

  // ---------------- Mise a jour (1 frame a 60 fps) ------------------------------
  function update() {
    frameCount++;

    // decor toujours anime (attente incluse)
    for (const c of clouds) {
      c.x -= speed * c.drift * (state === 'RUNNING' ? 1 : 0.4);
      if (c.x < -80) { c.x = CFG.W + 20; c.y = 12 + Math.random() * 40; }
    }
    for (const b of groundBumps) {
      b.x -= speed * (state === 'RUNNING' ? 1 : 0.4);
      if (b.x < -10) { b.x = CFG.W + Math.random() * 40; b.h = 3 + Math.floor(Math.random() * 5); }
    }

    if (state !== 'RUNNING') {
      if (state === 'WAITING') player.anim += 0.03; // flottement doux
      return;
    }

    // progression
    speed = Math.min(speed + CFG.ACCELERATION, CFG.MAX_SPEED);
    score += speed * CFG.SCORE_PER_PIXEL;
    if (score >= nextMilestone) {
      SFX.milestone();
      nextMilestone += 100;
    }
    night = Math.floor(score / CFG.NIGHT_EVERY) % 2 === 1;

    // joueur
    if (player.y > 0 || player.vy !== 0) {
      let g = CFG.GRAVITY;
      if (player.ducking) {
        // descente acceleree quand on baisse en l'air
        g += CFG.GRAVITY * CFG.SPEED_DROP_COEFFICIENT;
      } else if (player.jumpHeld && player.vy < 0) {
        // flottement : espace maintenu pendant la chute = descente tres lente
        g *= CFG.FLOAT_GRAVITY_COEFF;
      }
      player.vy -= g;
      player.y += player.vy;
      player.jumpTime++;
      if (player.y <= 0) {
        player.y = 0;
        player.vy = 0;
        player.jumpTime = 0;
      }
    }
    // couper le saut si relache avant la hauteur minimale
    if (!player.jumpHeld && player.vy > 0 && player.y < CFG.MIN_JUMP_HEIGHT) {
      player.vy = 0;
    }
    player.anim += 0.14 + speed * 0.008;

    updateObstacles();
    if (hits()) gameOver();

    scoreEl.textContent = String(Math.floor(score)).padStart(5, '0');
    hiEl.textContent = String(hiscore).padStart(5, '0');
  }

  // ---------------- Rendu -------------------------------------------------------
  function drawSky() {
    if (night) {
      const grad = ctx.createLinearGradient(0, 0, 0, CFG.H);
      grad.addColorStop(0, '#0b0b1e');
      grad.addColorStop(1, '#1c1030');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CFG.W, CFG.H);
      // etoiles scintillantes
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frameCount * 0.04 + s.p));
        ctx.fillStyle = `rgba(255, 244, 200, ${tw.toFixed(2)})`;
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      const mw = spriteW(IMG.moon, 2.2);
      ctx.drawImage(IMG.moon, CFG.W - mw - 46, 16, mw, spriteH(IMG.moon, 2.2));
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, CFG.H);
      grad.addColorStop(0, '#b8b8d8');
      grad.addColorStop(1, '#d8d0c0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CFG.W, CFG.H);
    }
    // nuages
    const cloudImg = night ? renderSprite(SPRITES.cloud, { C: SPRITE_PALETTE.N }) : IMG.cloud;
    for (const c of clouds) {
      ctx.drawImage(cloudImg, c.x, c.y, spriteW(cloudImg, 1.4), spriteH(cloudImg, 1.4));
    }
  }

  function drawGround() {
    const line = night ? '#8a86b0' : '#6a6257';
    ctx.fillStyle = line;
    ctx.fillRect(0, CFG.GROUND_Y + 1, CFG.W, 2);
    ctx.fillStyle = night ? 'rgba(138,134,176,0.7)' : 'rgba(106,98,87,0.7)';
    for (const b of groundBumps) {
      ctx.fillRect(b.x, CFG.GROUND_Y + 3, 3, 2);
      ctx.fillRect(b.x + 1, CFG.GROUND_Y + 3 - b.h, 2, b.h);
    }
  }

  function drawPlayer() {
    const ch = CHARACTERS[character];
    const waiting = state === 'WAITING';
    const duck = player.ducking && player.y === 0;
    const frames = duck ? ch.duck : ch.run;
    const img = IMG[frames[Math.floor(player.anim) % frames.length]];
    const w = spriteW(img, SCALE_PLAYER);
    const h = spriteH(img, SCALE_PLAYER);
    const bob = waiting ? Math.sin(frameCount * 0.08) * 3 - 3 : 0;
    ctx.drawImage(img, CFG.PLAYER_X, CFG.GROUND_Y - player.y - h + bob, w, h);
  }

  function drawObstacles() {
    for (const g of obstacles) {
      for (const p of g.pieces) {
        if (p.alt) {
          const frame = Math.floor(frameCount * 0.12) % 2 === 0 ? IMG.bat_A : IMG.bat_B;
          ctx.drawImage(frame, g.x + p.x, p.y, p.w, p.h);
        } else {
          ctx.drawImage(p.img, g.x + p.x, p.y, p.w, p.h);
        }
      }
    }
  }

  function drawWaitingPrompt() {
    ctx.fillStyle = 'rgba(20, 16, 34, 0.75)';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    const blink = Math.sin(frameCount * 0.06) > -0.3;
    if (blink) ctx.fillText('ESPACE ou clic pour jouer', CFG.W / 2, 66);
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('⬆ sauter (maintenir pour flotter)   ⬇ baisser', CFG.W / 2, 86);
    ctx.textAlign = 'left';
  }

  function render() {
    drawSky();
    drawGround();
    drawObstacles();
    drawPlayer();
    if (state === 'WAITING') drawWaitingPrompt();
  }

  // ---------------- Entrees ------------------------------------------------------
  function pressJump() {
    SFX.ensure();
    if (state === 'WAITING') startGame();
    else if (state === 'CRASHED') { reset(); state = 'RUNNING'; }
    else if (player.y === 0) {
      player.vy = CFG.INITIAL_JUMP_VELOCITY;
      player.jumpHeld = true;
      player.jumpTime = 0;
      SFX.jump();
    }
  }

  function releaseJump() {
    player.jumpHeld = false;
  }

  function setDuck(on) {
    player.ducking = on;
  }

  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); pressJump(); }
    else if (e.code === 'ArrowDown') { e.preventDefault(); setDuck(true); }
    else if (e.code === 'KeyM') { SFX.muted = !SFX.muted; localStorage.setItem('hr-muted', SFX.muted ? '1' : '0'); syncSoundBtn(); }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') releaseJump();
    else if (e.code === 'ArrowDown') setDuck(false);
  });
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); pressJump(); });

  restartBtn.addEventListener('click', () => { reset(); state = 'RUNNING'; SFX.ensure(); });

  // boutons tactiles (visibles sur ecrans tactiles)
  const touchJump = document.getElementById('touch-jump');
  const touchDuck = document.getElementById('touch-duck');
  if (touchJump) {
    touchJump.addEventListener('pointerdown', (e) => { e.preventDefault(); pressJump(); });
    touchJump.addEventListener('pointerup', () => releaseJump());
  }
  if (touchDuck) {
    touchDuck.addEventListener('pointerdown', (e) => { e.preventDefault(); setDuck(true); });
    touchDuck.addEventListener('pointerup', () => setDuck(false));
    touchDuck.addEventListener('pointerleave', () => setDuck(false));
  }

  // selection du personnage
  function syncCharBtns() {
    for (const b of charBtns) b.classList.toggle('active', b.dataset.char === character);
  }
  for (const b of charBtns) {
    b.addEventListener('click', () => {
      character = b.dataset.char;
      localStorage.setItem('hr-character', character);
      syncCharBtns();
    });
  }
  syncCharBtns();

  soundBtn.addEventListener('click', () => {
    SFX.muted = !SFX.muted;
    localStorage.setItem('hr-muted', SFX.muted ? '1' : '0');
    syncSoundBtn();
  });

  // ---------------- Boucle principale (pas de temps fixe) -------------------------
  let acc = 0;
  let last = performance.now();
  function loop(now) {
    acc += Math.min(now - last, 100); // plafond : evite le rattrapage enorme
    last = now;
    while (acc >= STEP_MS) {
      update();
      acc -= STEP_MS;
    }
    render();
    requestAnimationFrame(loop);
  }

  hiEl.textContent = String(hiscore).padStart(5, '0');
  scoreEl.textContent = '00000';
  requestAnimationFrame(loop);
})();
