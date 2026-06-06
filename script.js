// ===== STATE =====
const state = {
  visitorName: localStorage.getItem('anniversaryVisitor') || '',
  completedLevels: JSON.parse(localStorage.getItem('completedLevels') || '[]'),
  uploadedImages: JSON.parse(localStorage.getItem('galleryImages') || '[]'),
  musicPlaying: false,
  currentLevel: null,
};

// ===== CONFIG =====
// Add your parent background image path(s) here and any default gallery images.
const CONFIG = {
  // Set to a path or data URL for the parent photo background (example: 'images/parents.jpg')
  parentBackground: '',
  // Set this to the filename or path of the parents' photo to use directly in Level 3
  puzzleImage: '1.jpeg',
};

// Hardcode gallery images here (paths relative to this HTML file or absolute URLs).
// Place the image files in the same folder as anniversary_index.html.
const defaultGalleryImages = [
  '1.jpeg',
  '2.jpeg',
  '3.jpeg',
  '4.jpeg',
  '5.jpeg',
  '6.jpeg',
  '7.jpeg',
  '8.jpeg',
  '9.jpeg',
];

// Hardcode puzzle images here (these will be shown inside Level 3 as selectable photos)
const defaultPuzzleImages = [
  '1.jpeg',
  '2.jpeg',
  '3.jpeg',
  '4.jpeg',
  '5.jpeg',
  '6.jpeg',
  '7.jpeg',
  '8.jpeg',
  '9.jpeg',
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  updateQuestProgress();
  renderGallery();
  initMusicToggle();

  // Always include hardcoded default gallery images, while also preserving any previously saved images.
  if (defaultGalleryImages.length > 0) {
    const savedImages = Array.isArray(state.uploadedImages) ? state.uploadedImages : [];
    state.uploadedImages = Array.from(new Set([...defaultGalleryImages, ...savedImages]));
    localStorage.setItem('galleryImages', JSON.stringify(state.uploadedImages.slice(-20)));
    renderGallery();
  }

  // Apply parent background image if configured
  if (CONFIG.parentBackground && CONFIG.parentBackground.trim() !== '') {
    document.body.style.backgroundImage = `linear-gradient(rgba(10,14,26,0.6), rgba(10,14,26,0.6)), url('${CONFIG.parentBackground}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  if (state.visitorName) {
    document.getElementById('visitorName').value = state.visitorName;
  }
});

// ===== SECTION NAVIGATION =====
function goToSection(id) {
  document.querySelectorAll('.section').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.style.display = 'flex';
  target.classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'surprise') initConfetti();
  if (id === 'quest') updateQuestProgress();
  if (id === 'gallery') renderGallery();
}

// ===== HERO COUNTDOWN =====
function updateCountdown() {
  const anniversary = new Date('2026-06-07T00:00:00');
  const now = new Date();
  const diff = anniversary - now;
  const el = document.getElementById('heroCountdown');
  if (!el) return;

  if (diff <= 0) {
    el.textContent = '✦ Today is the Day! Happy 23rd Anniversary! ✦';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  el.textContent = `✦ ${days}d ${hours}h ${mins}m ${secs}s until the anniversary ✦`;
}

// ===== WELCOME =====
function startJourney() {
  const name = document.getElementById('visitorName').value.trim();
  if (!name) { document.getElementById('visitorName').focus(); return; }
  state.visitorName = name;
  localStorage.setItem('anniversaryVisitor', name);

  const msg = document.getElementById('welcomeMsg');
  msg.classList.remove('hidden');
  msg.textContent = `Welcome, ${name}! Let the love quest begin… 💖`;

  setTimeout(() => goToSection('quest'), 1500);
}

// ===== QUEST PROGRESS =====
function updateQuestProgress() {
  const completed = state.completedLevels;
  const pct = (completed.length / 5) * 100;
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (fill) fill.style.width = pct + '%';
  if (text) text.textContent = `${completed.length} / 5 levels complete`;

  const greeting = document.getElementById('questGreeting');
  if (greeting && state.visitorName) {
    greeting.textContent = `The Love Quest, ${state.visitorName}`;
  }

  for (let i = 1; i <= 5; i++) {
    const node = document.getElementById('lvl' + i);
    if (!node) continue;
    node.classList.remove('completed', 'locked');
    if (completed.includes(i)) {
      node.classList.add('completed');
    }
  }
}

function completeLevel(lvl) {
  if (!state.completedLevels.includes(lvl)) {
    state.completedLevels.push(lvl);
    localStorage.setItem('completedLevels', JSON.stringify(state.completedLevels));
  }
  updateQuestProgress();
}

function openLevel(lvl) {
  state.currentLevel = lvl;
  const modal = document.getElementById('levelModal');
  modal.classList.add('active');

  const builders = [null, buildLevel1, buildLevel2, buildLevel3, buildLevel4, buildLevel5];
  document.getElementById('modalContent').innerHTML = '';
  builders[lvl]();
}

function closeModal() {
  document.getElementById('levelModal').classList.remove('active');
  state.currentLevel = null;
}

// ===== LEVEL 1: WORD WHISPER =====
const wordChallenges = [
  { clue: 'It has no beginning, no end, and nothing in the middle — yet it holds everything together between two people.', answer: 'love', hint: 'L _ _ _' },
  { clue: 'Raj Sekhar and Sandhya Rani have been on this beautiful journey for 23 years. What is it called?', answer: 'marriage', hint: 'M _ _ _ _ _ _ _' },
  { clue: 'Every year on June 7th, we celebrate this special day that marks when two hearts became one family.', answer: 'anniversary', hint: 'A _ _ _ _ _ _ _ _ _ _' },
];

function buildLevel1() {
  const q = wordChallenges[Math.floor(Math.random() * wordChallenges.length)];
  document.getElementById('modalContent').innerHTML = `
    <div class="level-header">
      <span class="level-badge">💌</span>
      <div class="level-title">Level 1 · Word Whisper</div>
      <div class="level-desc">Guess the romantic word hidden in the clue</div>
    </div>
    <div class="word-game">
      <div class="word-clue">${q.clue}</div>
      <div style="color: var(--gold); font-size:0.85rem; margin-bottom:1rem; letter-spacing:0.1em;">${q.hint}</div>
      <div class="word-input-wrap">
        <input class="word-input" id="wordAnswer" placeholder="Type your answer…" 
          onkeydown="if(event.key==='Enter') checkWord('${q.answer}')">
        <button class="submit-btn" onclick="checkWord('${q.answer}')">Submit</button>
      </div>
      <div class="feedback" id="wordFeedback"></div>
    </div>
  `;
  document.getElementById('wordAnswer').focus();
}

function checkWord(answer) {
  const val = document.getElementById('wordAnswer').value.trim().toLowerCase();
  const fb = document.getElementById('wordFeedback');
  if (val === answer.toLowerCase()) {
    fb.className = 'feedback correct';
    fb.textContent = '✨ Wonderful! You got it! Love speaks in whispers…';
    completeLevel(1);
    setTimeout(() => { closeModal(); showToast('Level 1 Complete! 💌'); }, 1800);
  } else {
    fb.className = 'feedback wrong';
    fb.textContent = '💔 Not quite… try again, dear!';
  }
}

// ===== LEVEL 2: MEMORY MATCH =====
const emojiPairs = ['💖', '🌹', '🌙', '⭐', '🎵', '💍', '🕊️', '🌸'];

function buildLevel2() {
  const pairs = [...emojiPairs, ...emojiPairs]
    .sort(() => Math.random() - 0.5)
    .map((e, i) => ({ id: i, emoji: e, revealed: false, matched: false }));

  let firstFlipped = null, lockBoard = false, matchCount = 0;

  document.getElementById('modalContent').innerHTML = `
    <div class="level-header">
      <span class="level-badge">🧠</span>
      <div class="level-title">Level 2 · Memory Match</div>
      <div class="level-desc">Match all the pairs to complete the level</div>
    </div>
    <div class="mem-status" id="memStatus">Pairs found: 0 / 8</div>
    <div class="memory-grid" id="memGrid"></div>
  `;

  const grid = document.getElementById('memGrid');

  pairs.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card hidden-face';
    el.dataset.index = i;
    el.onclick = () => {
      if (lockBoard || card.matched || card.revealed) return;
      card.revealed = true;
      el.classList.remove('hidden-face');
      el.classList.add('flipped');
      el.textContent = card.emoji;

      if (!firstFlipped) {
        firstFlipped = { card, el };
      } else {
        lockBoard = true;
        if (firstFlipped.card.emoji === card.emoji) {
          firstFlipped.el.classList.add('matched');
          el.classList.add('matched');
          firstFlipped.card.matched = true;
          card.matched = true;
          matchCount++;
          document.getElementById('memStatus').textContent = `Pairs found: ${matchCount} / 8`;
          firstFlipped = null;
          lockBoard = false;
          if (matchCount === 8) {
            completeLevel(2);
            setTimeout(() => { closeModal(); showToast('Level 2 Complete! 🧠✨'); }, 800);
          }
        } else {
          setTimeout(() => {
            firstFlipped.el.classList.add('hidden-face');
            firstFlipped.el.classList.remove('flipped');
            firstFlipped.el.textContent = '';
            el.classList.add('hidden-face');
            el.classList.remove('flipped');
            el.textContent = '';
            firstFlipped.card.revealed = false;
            card.revealed = false;
            firstFlipped = null;
            lockBoard = false;
          }, 900);
        }
      }
    };
    grid.appendChild(el);
  });
}

// ===== LEVEL 3: PHOTO PUZZLE =====
function buildLevel3() {
  // Build Level 3 UI: show selectable images from defaultPuzzleImages and gallery images
  const puzzleOptions = [];
  // If a configured puzzle image exists, show it first
  if (CONFIG.puzzleImage && CONFIG.puzzleImage.trim() !== '') {
    puzzleOptions.push({ src: CONFIG.puzzleImage, label: '' });
  }
  if (defaultPuzzleImages && defaultPuzzleImages.length > 0) {
    puzzleOptions.push(...defaultPuzzleImages.map(img => ({ src: img, label: '' })));
  }
  if (state.uploadedImages && state.uploadedImages.length > 0) {
    puzzleOptions.push(...state.uploadedImages.slice(0, 8).map(img => ({ src: img, label: '' })));
  }

  document.getElementById('modalContent').innerHTML = `
    <div class="level-header">
      <span class="level-badge">🧩</span>
      <div class="level-title">Level 3 · Photo Puzzle</div>
      <div class="level-desc">Choose a photo to split into a puzzle</div>
    </div>
    <div class="puzzle-upload" id="puzzleUploadArea">
      <div style="font-size:0.9rem;color:var(--gold);margin-bottom:0.6rem;">Select a photo (provided in code)</div>
      <div id="puzzleOptions" style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center;">
        ${puzzleOptions.length > 0 ? puzzleOptions.map(opt => `
          <img src="${opt.src}" alt="Puzzle photo" onclick="usePuzzleImage('${opt.src}')" 
            style="width:70px;height:70px;object-fit:cover;border-radius:0.5rem;border:2px solid var(--glass-border);cursor:pointer;transition:all 0.3s;" 
            onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='var(--glass-border)'" 
            onerror="this.style.display='none'" />
        `).join('') : `
          <div style="color:rgba(245,240,234,0.5);padding:1rem 2rem;">No puzzle images configured. Add paths to <strong>defaultPuzzleImages</strong> in <em>script.js</em></div>
        `}
      </div>
    </div>
    <div id="puzzleGame" style="display:none"></div>
  `;
}

function usePuzzleImage(src) {
  setupPuzzleFromSrc(src);
}

function initPuzzle(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => setupPuzzleFromSrc(e.target.result);
  reader.readAsDataURL(file);
}

function setupPuzzleFromSrc(src) {
  const img = new Image();
  img.onload = () => {
    const COLS = 3, ROWS = 3;
    const pw = 180, ph = 180;
    const tw = pw / COLS, th = ph / ROWS;
    const total = COLS * ROWS;

    document.getElementById('puzzleUploadArea').style.display = 'none';
    const gameDiv = document.getElementById('puzzleGame');
    gameDiv.style.display = 'block';

    // Create pieces array
    const positions = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    let solved = 0;

    gameDiv.innerHTML = `
      <div class="puzzle-container">
        <div>
          <div style="color:var(--gold);font-size:0.75rem;text-align:center;margin-bottom:0.5rem;">Drag to solve</div>
          <div class="puzzle-area" id="puzzleBoard" style="grid-template-columns: repeat(${COLS}, ${tw}px);"></div>
          <div style="text-align:center;margin-top:0.5rem;color:var(--gold);font-size:0.8rem;" id="puzzleSolved">Solved: 0/${total}</div>
        </div>
        <div class="puzzle-target">
          <img src="${src}">
          <div class="puzzle-target-label">Target ↑</div>
        </div>
      </div>
    `;

    const board = document.getElementById('puzzleBoard');

    positions.forEach((origIdx, slotIdx) => {
      const col = origIdx % COLS;
      const row = Math.floor(origIdx / COLS);
      const canvas = document.createElement('canvas');
      canvas.width = tw; canvas.height = th;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, col * (img.width / COLS), row * (img.height / ROWS), img.width / COLS, img.height / ROWS, 0, 0, tw, th);

      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.style.cssText = `width:${tw}px;height:${th}px;`;
      piece.dataset.origIdx = origIdx;
      piece.dataset.slotIdx = slotIdx;
      piece.appendChild(canvas);
      piece.draggable = true;

      piece.ondragstart = e => {
        e.dataTransfer.setData('text/plain', slotIdx);
        piece.style.opacity = '0.5';
      };
      piece.ondragend = () => { piece.style.opacity = '1'; };
      piece.ondragover = e => { e.preventDefault(); piece.classList.add('drag-over'); };
      piece.ondragleave = () => { piece.classList.remove('drag-over'); };
      piece.ondrop = e => {
        e.preventDefault();
        piece.classList.remove('drag-over');
        const fromSlot = parseInt(e.dataTransfer.getData('text/plain'));
        const toSlot = slotIdx;
        if (fromSlot === toSlot) return;

        const fromPiece = board.querySelector(`[data-slot-idx="${fromSlot}"]`);
        const toPiece = board.querySelector(`[data-slot-idx="${toSlot}"]`);
        if (!fromPiece || !toPiece) return;

        // swap in DOM
        const placeholder = document.createElement('div');
        fromPiece.parentNode.insertBefore(placeholder, fromPiece);
        toPiece.parentNode.insertBefore(fromPiece, toPiece);
        placeholder.parentNode.insertBefore(toPiece, placeholder);
        placeholder.remove();

        fromPiece.dataset.slotIdx = toSlot;
        toPiece.dataset.slotIdx = fromSlot;

        checkPuzzleSolved(board, total);
      };

      board.appendChild(piece);
    });
  };
  img.src = src;
}

function checkPuzzleSolved(board, total) {
  const pieces = board.querySelectorAll('.puzzle-piece');
  let correct = 0;
  pieces.forEach(p => {
    const idx = parseInt(p.dataset.slotIdx);
    const orig = parseInt(p.dataset.origIdx);
    if (idx === orig) { p.classList.add('correct'); correct++; }
    else p.classList.remove('correct');
  });
  document.getElementById('puzzleSolved').textContent = `Solved: ${correct}/${total}`;
  if (correct === total) {
    completeLevel(3);
    setTimeout(() => { closeModal(); showToast('Level 3 Complete! Puzzle solved! 🧩✨'); }, 600);
  }
}

// ===== LEVEL 4: HEART RIDDLE =====
const riddles = [
  {
    q: 'I witnessed the vows of Raj Sekhar and Sandhya Rani on June 7, 2003. Every year I return to remind them. What am I?',
    options: ['Their Wedding Day', 'Their First Fight', 'A Birthday', 'A Holiday'],
    answer: 0
  },
  {
    q: 'I live in photographs, in old songs, in the smell of home-cooked food. I cannot be bought, but I am the richest thing a family owns. What am I?',
    options: ['Time', 'A Memory', 'Money', 'A Secret'],
    answer: 1
  },
  {
    q: 'The more you give me away, the more of me you have. I grow stronger in 23 years. Parents know me best. What am I?',
    options: ['Patience', 'Trust', 'Love', 'Wisdom'],
    answer: 2
  },
];

function buildLevel4() {
  const r = riddles[Math.floor(Math.random() * riddles.length)];
  document.getElementById('modalContent').innerHTML = `
    <div class="level-header">
      <span class="level-badge">❤️</span>
      <div class="level-title">Level 4 · Heart Riddle</div>
      <div class="level-desc">Solve the riddle of love</div>
    </div>
    <div class="riddle-box">
      <div class="riddle-question">${r.q}</div>
      <div class="riddle-options" id="riddleOptions">
        ${r.options.map((opt, i) => `
          <button class="riddle-option" onclick="checkRiddle(${i}, ${r.answer}, this)">${opt}</button>
        `).join('')}
      </div>
      <div style="margin-top:1rem;min-height:1.5rem;" id="riddleFeedback"></div>
    </div>
  `;
}

function checkRiddle(chosen, correct, btn) {
  const opts = document.querySelectorAll('.riddle-option');
  opts.forEach(o => o.style.pointerEvents = 'none');
  const fb = document.getElementById('riddleFeedback');
  if (chosen === correct) {
    btn.classList.add('correct-ans');
    fb.style.color = '#6fcf97';
    fb.textContent = '✨ You understand love perfectly!';
    completeLevel(4);
    setTimeout(() => { closeModal(); showToast('Level 4 Complete! ❤️✨'); }, 1800);
  } else {
    btn.classList.add('wrong-ans');
    opts[correct].classList.add('correct-ans');
    fb.style.color = '#eb5757';
    fb.textContent = '💔 Not quite… but love teaches us to try again!';
    setTimeout(() => {
      opts.forEach(o => { o.classList.remove('wrong-ans', 'correct-ans'); o.style.pointerEvents = 'auto'; });
      fb.textContent = '';
    }, 2000);
  }
}

// ===== LEVEL 5: FINAL QUEST =====
function buildLevel5() {
  document.getElementById('modalContent').innerHTML = `
    <div class="level-header">
      <span class="level-badge">🎁</span>
      <div class="level-title">Final Quest · Grand Surprise</div>
      <div class="level-desc">You made it! Unlock the grand anniversary surprise</div>
    </div>
    <div style="text-align:center;">
      <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.15rem;color:rgba(245,240,234,0.8);margin-bottom:2rem;line-height:1.7;">
        You have walked every step of this love journey, just as Mom and Dad have walked every step of theirs — with patience, dedication, and so much heart.
      </p>
      <div style="font-size:3rem;margin-bottom:1.5rem;animation:heartPulse 1s infinite;">💖</div>
      <button class="cta-btn" onclick="unlockSurprise()">✨ Unlock the Grand Surprise ✨</button>
    </div>
  `;
}

function unlockSurprise() {
  completeLevel(5);
  closeModal();
  // Populate surprise gallery
  const sg = document.getElementById('surpriseGallery');
  sg.innerHTML = state.uploadedImages.slice(0, 6).map(img =>
    `<img src="${img}" alt="Memory">`
  ).join('');
  goToSection('surprise');
  setTimeout(initConfetti, 300);
}

// ===== GALLERY =====
function addToGallery(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      state.uploadedImages.push(e.target.result);
      localStorage.setItem('galleryImages', JSON.stringify(state.uploadedImages.slice(-20)));
      renderGallery();
    };
    reader.readAsDataURL(file);
  });
}

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  if (state.uploadedImages.length === 0) {
    grid.innerHTML = `
      <div class="gallery-placeholder">
        <div class="placeholder-icon">📷</div>
        <p>No photos yet — add image paths to <strong>defaultGalleryImages</strong> in <em>script.js</em></p>
      </div>`;
    return;
  }
  grid.innerHTML = state.uploadedImages.map((img, i) => `
    <div class="gallery-item" onclick="openLightbox('${img}')">
      <img src="${img}" alt="Memory ${i + 1}">
    </div>
  `).join('');
}

function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  lb.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
}

// ===== LOVE LETTER =====
function openLetter() {
  document.getElementById('letterSeal').style.display = 'none';
  document.getElementById('letterContent').classList.remove('hidden');
}

// ===== PARTICLES =====
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 50 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: -Math.random() * 0.5 - 0.2,
    opacity: Math.random() * 0.5 + 0.1,
    type: Math.random() > 0.6 ? '♥' : '✦',
    color: Math.random() > 0.5 ? '#c9a84c' : '#e8a0bf',
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.font = `${p.size * 6}px serif`;
      ctx.fillText(p.type, p.x, p.y);
      ctx.restore();

      p.x += p.speedX;
      p.y += p.speedY;
      if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== CONFETTI =====
let confettiRunning = false;
function initConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;

  const colors = ['#c9a84c', '#f0d070', '#e8a0bf', '#c96c9b', '#ffffff', '#6fcf97'];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 3 + 2,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 5,
  }));

  confettiRunning = true;
  function draw() {
    if (!confettiRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();

      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width; }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== MUSIC =====
function initMusicToggle() {
  const btn = document.getElementById('musicToggle');
  const audio = document.getElementById('bgMusic');
  btn.addEventListener('click', () => {
    if (state.musicPlaying) {
      audio.pause();
      btn.textContent = '🔇';
      state.musicPlaying = false;
    } else {
      audio.play().catch(() => {});
      btn.textContent = '🎵';
      state.musicPlaying = true;
    }
  });
}

// ===== DOWNLOAD CARD =====
function downloadCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0a0e1a');
  grad.addColorStop(0.5, '#1a2744');
  grad.addColorStop(1, '#0d1526');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Gold border
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 1020, 1020);
  ctx.strokeRect(50, 50, 980, 980);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0d070';
  ctx.font = 'bold 80px serif';
  ctx.fillText('23rd', 540, 280);

  ctx.fillStyle = '#c9a84c';
  ctx.font = '50px serif';
  ctx.fillText('Wedding Anniversary', 540, 360);

  ctx.fillStyle = '#e8a0bf';
  ctx.font = 'italic 38px serif';
  ctx.fillText('Mr. Raj Sekhar ♥ Mrs. Sandhya Rani', 540, 460);

  ctx.fillStyle = '#f5f0ea';
  ctx.font = '28px sans-serif';
  ctx.fillText('07 June 2003 — 07 June 2026', 540, 540);

  // Hearts
  ctx.font = '60px serif';
  ctx.fillText('💖', 540, 660);

  ctx.fillStyle = 'rgba(245,240,234,0.7)';
  ctx.font = 'italic 24px serif';
  const lines = [
    'Twenty-three years of love, laughter,',
    'and an unbreakable bond.',
    'Today and always — we celebrate YOU.'
  ];
  lines.forEach((line, i) => ctx.fillText(line, 540, 760 + i * 40));

  ctx.fillStyle = '#c9a84c';
  ctx.font = '22px serif';
  ctx.fillText('With all our love ♥', 540, 950);

  const link = document.createElement('a');
  link.download = 'Anniversary_Card_RajSekhar_SandhyaRani.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== SHARE WHATSAPP =====
function shareWhatsApp() {
  const msg = `💖 Happy 23rd Wedding Anniversary Mom & Dad! 💖\n\nMr. Raj Sekhar & Mrs. Sandhya Rani\n07 June 2003 — 07 June 2026\n\nTwenty-three years of love, laughter, and an unbreakable bond. 🌹`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

// ===== RESET =====
function resetQuest() {
  state.completedLevels = [];
  localStorage.removeItem('completedLevels');
  updateQuestProgress();
  goToSection('quest');
  confettiRunning = false;
}

// ===== TOAST =====
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#c9a84c,#c96c9b);
      color:#0a0e1a;padding:0.75rem 1.5rem;border-radius:3rem;
      font-family:'Cinzel',serif;font-size:0.85rem;font-weight:600;
      z-index:500;box-shadow:0 4px 20px rgba(201,168,76,0.5);
      transition:all 0.3s;letter-spacing:0.05em;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
