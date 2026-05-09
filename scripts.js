document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const bgMusic = document.getElementById('bg-music');
    const winVideo = document.getElementById('win-video');
    const moveDisplay = document.getElementById('move-counter');
    const bestDisplay = document.getElementById('best-score');
    const startBtn = document.getElementById('start-btn');

    const sfx = {
        flip: document.getElementById('sound-flip'),
        match: document.getElementById('sound-match'),
        mismatch: document.getElementById('sound-mismatch')
    };

    const totalPool = 69; 
    const pairsCount = 8; 
    let firstCard, secondCard, hasFlipped = false, lockBoard = false, matches = 0, moves = 0;
    let audioState = { bg: 0.5, sfx: 0.5, muted: false };

    function getSavedData(key, defaultVal) {
        try { return localStorage.getItem(key) || defaultVal; } 
        catch (e) { return defaultVal; }
    }
    
    function setSavedData(key, val) {
        try { localStorage.setItem(key, val); } 
        catch (e) { console.warn("Storage memory blocked by browser, ignoring."); }
    }

    if (bestDisplay) bestDisplay.innerText = getSavedData('memoryGameBest', '--');

    function applyVolumes() {
        try {
            if (bgMusic) bgMusic.volume = audioState.muted ? 0 : audioState.bg;
            Object.values(sfx).forEach(s => { if(s) s.volume = audioState.muted ? 0 : audioState.sfx; });
            if (winVideo) winVideo.volume = audioState.muted ? 0 : audioState.sfx;
        } catch (e) {
            console.warn("Volume control restricted by device, ignoring.");
        }
    }

    function initGame() {
        if (!gameBoard) return;
        gameBoard.innerHTML = '';
        matches = 0; moves = 0;
        hasFlipped = false; lockBoard = false;
        if (moveDisplay) moveDisplay.innerText = '0';
        
        const winModal = document.getElementById('win-modal');
        if (winModal) winModal.style.display = 'none';
        
        if (winVideo) {
            winVideo.pause();
            winVideo.currentTime = 0;
        }
        
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
                <div class="front-face"><img src="img/${name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
                <div class="back-face"></div>`;
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard || this === firstCard || this.classList.contains('flip') || this.classList.contains('matched')) return;
        
        if (bgMusic && bgMusic.paused) bgMusic.play().catch(()=>{});
        
        this.classList.add('flip');
        if (sfx.flip) { sfx.flip.currentTime = 0; sfx.flip.play().catch(()=>{}); }
        
        if (!hasFlipped) { 
            hasFlipped = true; 
            firstCard = this; 
            return; 
        }
        
        secondCard = this;
        moves++;
        if (moveDisplay) moveDisplay.innerText = moves;
        checkMatch();
    }

    function checkMatch() {
        if (firstCard.dataset.id === secondCard.dataset.id) {
            matches++;
            if (sfx.match) { sfx.match.currentTime = 0; sfx.match.play().catch(()=>{}); }
            
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            
            if (matches === pairsCount) handleWin();
            resetTurn();
        } else {
            lockBoard = true; 
            if (sfx.mismatch) { sfx.mismatch.currentTime = 0; sfx.mismatch.play().catch(()=>{}); }
            
            firstCard.classList.add('shake');
            secondCard.classList.add('shake');
            
            setTimeout(() => {
                firstCard.classList.remove('shake', 'flip');
                secondCard.classList.remove('shake', 'flip');
                resetTurn();
            }, 1000);
        }
    }

    function handleWin() {
        try { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); } catch(e){}
        
        let lastPlayed = getSavedData('lastWinVideo', '2');
        let nextToPlay = lastPlayed === '1' ? '2' : '1';
        
        setSavedData('lastWinVideo', nextToPlay);

        const currentBest = getSavedData('memoryGameBest', null);
        if (!currentBest || moves < parseInt(currentBest)) {
            setSavedData('memoryGameBest', moves);
            if (bestDisplay) bestDisplay.innerText = moves;
        }
        
        setTimeout(() => { 
            const winModal = document.getElementById('win-modal');
            if (winModal) winModal.style.display = 'flex'; 
            
            if (bgMusic) bgMusic.pause();
            
            if (winVideo) {
                winVideo.src = `video/win${nextToPlay}.mp4`;
                winVideo.load();
                winVideo.play().catch(e => console.log("Video autoplay blocked by browser"));
            }
        }, 600);
    }

    function resetTurn() { 
        hasFlipped = false; 
        lockBoard = false; 
        firstCard = null; 
        secondCard = null; 
    }

    window.toggleAudioModal = function() {
        const modal = document.getElementById('audio-modal');
        if (modal) modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    };

    window.toggleMute = function() {
        audioState.muted = !audioState.muted;
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) muteBtn.innerText = audioState.muted ? 'Mute: ON' : 'Mute: OFF';
        applyVolumes();
    };

    let timer = 5;
    const countdown = setInterval(() => {
        timer--;
        const countEl = document.getElementById('count-num');
        if (countEl) countEl.innerText = timer;
        
        if (timer <= 0) {
            clearInterval(countdown);
            const timerText = document.getElementById('timer-text');
            if (timerText) timerText.style.display = 'none';
            
            if (startBtn) {
                startBtn.style.display = 'inline-block';
            } else {
                const intro = document.getElementById('intro-overlay');
                if (intro) intro.style.display = 'none';
                initGame();
            }
        }
    }, 1000);

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const intro = document.getElementById('intro-overlay');
            if (intro) intro.style.display = 'none';
            applyVolumes();
            if (bgMusic) bgMusic.play().catch(() => {});
            initGame();
        });
    }

    const bgSlider = document.getElementById('bg-music-slider');
    if (bgSlider) bgSlider.addEventListener('input', (e) => { audioState.bg = e.target.value; applyVolumes(); });

    const sfxSlider = document.getElementById('sfx-slider');
    if (sfxSlider) sfxSlider.addEventListener('input', (e) => { audioState.sfx = e.target.value; applyVolumes(); });

    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) newGameBtn.addEventListener('click', initGame);

    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) playAgainBtn.addEventListener('click', initGame);
});
