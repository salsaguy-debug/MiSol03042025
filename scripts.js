const gameBoard = document.getElementById('game-board');
const bgMusic = document.getElementById('bg-music');
const sfx = {
    flip: document.getElementById('sound-flip'),
    match: document.getElementById('sound-match'),
    mismatch: document.getElementById('sound-mismatch')
};

const totalPool = 35; // Number of unique images available
const pairsCount = 8; // Playing with 16 cards (8 pairs)
let firstCard, secondCard;
let hasFlipped = false;
let lockBoard = false;
let matches = 0;
let moves = 0;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0; moves = 0;
    document.getElementById('move-counter').innerText = '0';
    document.getElementById('win-modal').style.display = 'none';
    
    let images = [];
    const v = new Date().getTime(); // Refresh images

    for (let i = 1; i <= totalPool; i++) {
        if (i === 6 || i === 30 || i === 40) continue; // Exclude system images
        images.push(`${i}.png?v=${v}`);
    }

    images.sort(() => Math.random() - 0.5);
    let selection = images.slice(0, pairsCount);
    let deck = [...selection, ...selection].sort(() => Math.random() - 0.5);

    deck.forEach(name => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.id = name.split('?')[0]; 
        card.innerHTML = `
            <div class="front-face">
                <img src="img/${name}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
            </div>
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    sfx.flip.play().catch(()=>{});

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.getElementById('move-counter').innerText = moves;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.id === secondCard.dataset.id;
    if (isMatch) {
        matches++;
        sfx.match.play().catch(()=>{});
        if (matches === pairsCount) {
            confetti({ particleCount: 150, spread: 70 });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        sfx.mismatch.play().catch(()=>{});
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

function updateVolume(val) {
    bgMusic.volume = val;
    Object.values(sfx).forEach(s => s.volume = val);
}

function toggleMute() {
    bgMusic.muted = !bgMusic.muted;
    Object.values(sfx).forEach(s => s.muted = bgMusic.muted);
    document.getElementById('mute-btn').innerText = bgMusic.muted ? '🔇' : '🔊';
}

// Fixed Countdown Timer
let timer = 5;
const timerDisplay = document.getElementById('count-num');
const countdown = setInterval(() => {
    timer--;
    if(timerDisplay) timerDisplay.innerText = timer;
    if (timer <= 0) {
        clearInterval(countdown);
        document.getElementById('intro-overlay').style.display = 'none';
        bgMusic.play().catch(() => console.log("User must click to play audio"));
        initGame();
    }
}, 1000);
