const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const moveDisplay = document.getElementById('move-counter');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 35; 
const pairsCount = 8; 
let firstCard, secondCard, hasFlipped, lockBoard, matches, moves = 0;

// Button Event Listeners
document.getElementById('new-game-btn').addEventListener('click', resetGame);
document.getElementById('play-again-btn').addEventListener('click', resetGame);
document.getElementById('mute-btn').addEventListener('click', toggleMute);
document.getElementById('volume-slider').addEventListener('input', (e) => updateVolume(e.target.value));

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    hasFlipped = false; lockBoard = false;
    moveDisplay.innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i === 3 || i === 30 || i === 40) continue; 
        images.push(`${i}.png`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name;
        card.innerHTML = `
            <div class="front-face"><img src="img/${name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"></div>
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    if (bgMusic.paused) bgMusic.play().catch(() => {});
    if (sfx.flip) sfx.flip.play();

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }
    secondCard = this;
    moves++;
    moveDisplay.innerText = moves;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;
    if (isMatch) {
        matches++;
        if (sfx.match) sfx.match.play();
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 600);
        }
        resetTurn();
    } else {
        lockBoard = true;
        if (sfx.mismatch) sfx.mismatch.play();
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    [hasFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetGame() { initGame(); }

// Modal & Audio Logic
function toggleAudioModal() {
    const modal = document.getElementById('audio-modal');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

function updateVolume(val) {
    bgMusic.volume = val;
    Object.values(sfx).forEach(s => s.volume = val);
}

function toggleMute() {
    bgMusic.muted = !bgMusic.muted;
    Object.values(sfx).forEach(s => s.muted = bgMusic.muted);
    document.getElementById('mute-btn').innerText = bgMusic.muted ? 'Mute All: ON' : 'Mute All: OFF';
}

// Countdown
let timer = 5;
const countdown = setInterval(() => {
    timer--;
    document.getElementById('count-num').innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        document.getElementById('intro-overlay').style.display = 'none';
        initGame();
    }
}, 1000);
