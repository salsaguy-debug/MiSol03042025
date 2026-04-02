const gameBoard = document.getElementById('game-board');
const totalPool = 34;
const pairsToMatch = 8;

let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard;
let matches = 0;

function initGame() {
    gameBoard.innerHTML = '';
    matches = 0;

    // Mapping your specific file extensions from GitHub
    let imagePool = [];
    for (let i = 1; i <= totalPool; i++) {
        if (i !== 6 && i !== 30) {
            let ext = '.jpg'; // Default
            if ([29, 3, 30, 6, 7, 8, 9].includes(i)) ext = '.png';
            if ([1, 31, 32, 33, 34].includes(i)) ext = '.jpeg';
            
            imagePool.push(`${i}${ext}`);
        }
    }

    // Random selection and shuffle
    imagePool.sort(() => Math.random() - 0.5);
    let selected = imagePool.slice(0, pairsToMatch);
    let deck = [...selected, ...selected].sort(() => Math.random() - 0.5);

    deck.forEach(imgFile => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = imgFile;
        card.innerHTML = `
            <img class="front-face" src="img/${imgFile}">
            <div class="back-face"></div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');
    document.getElementById('sound-flip').play();

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    if (isMatch) {
        matches++;
        document.getElementById('sound-match').play();
        if (matches === pairsToMatch) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setTimeout(() => { document.getElementById('win-modal').style.display = 'flex'; }, 500);
        }
        resetTurn();
    } else {
        lockBoard = true;
        document.getElementById('sound-mismatch').play();
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

// Global Countdown Logic
let countdown = 5;
const timer = setInterval(() => {
    countdown--;
    document.getElementById('count-num').innerText = countdown;
    if (countdown === 0) {
        clearInterval(timer);
        document.getElementById('intro-overlay').style.display = 'none';
        document.getElementById('bg-music').play();
        initGame();
    }
}, 1000);
