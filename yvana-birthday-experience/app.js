/* =========================================
   1. FIREBASE SETUP & NOTIFICATIONS
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Put your key here if you have it
    projectId: "YOUR_PROJECT_ID",
    appId: "APP_ID"
};

let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.warn("Offline mode.");
}

// Sends notification to Firebase (You see this in your console)
async function logEvent(type, data) {
    if (!db) return;
    try { await addDoc(collection(db, "interactions"), { type, data, timestamp: new Date() }); } catch (e) {}
}

// Global vars
const bgMusic = document.getElementById('bg-music');
const voiceNote = document.getElementById('voice-note');

/* =========================================
   2. LANDING PAGE & RUNAWAY BUTTON
   ========================================= */
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const landingContent = document.querySelector('.landing-content');
const playTrigger = document.getElementById('play-trigger');

function moveButton() {
    if (btnNo.style.position !== 'fixed') btnNo.style.position = 'fixed';
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    btnNo.style.left = `${Math.max(20, x)}px`;
    btnNo.style.top = `${Math.max(20, y)}px`;
}
btnNo.addEventListener('mouseover', moveButton);
btnNo.addEventListener('touchstart', (e) => { e.preventDefault(); moveButton(); });

btnYes.addEventListener('click', () => {
    landingContent.style.display = 'none';
    playTrigger.classList.remove('hidden');
    btnNo.style.display = 'none'; 
    logEvent('Yvana clicked YES', { mood: 'Happy' });
});

// START EXPERIENCE
document.getElementById('start-experience').addEventListener('click', (e) => {
    e.stopPropagation(); // Stops ghost clicks
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("Audio waiting..."));
    nextScene('scene-candle');
    logEvent('Experience Started', {});
});

/* =========================================
   3. CANDLE LOGIC (SAFETY LOCKED)
   ========================================= */
const candleWrapper = document.getElementById('candle-wrapper');
let isCandleReady = false; // The Lock

if (candleWrapper) {
    candleWrapper.addEventListener('click', blowOutCandle);
}

function blowOutCandle() {
    // 🛑 SAFETY CHECK
    if (!isCandleReady) return;

    const flame = document.getElementById('flame');
    const instruction = document.getElementById('candle-instruction');
    const fog = document.querySelector('.fog-layer');

    if (flame.style.opacity === '0') return;

    // Animation
    flame.style.transition = 'opacity 0.5s, transform 0.5s';
    flame.style.opacity = '0';
    flame.style.transform = 'scale(0)';
    
    instruction.innerHTML = "<strong>Happy Birthday!</strong>";
    if(fog) fog.style.opacity = '0';

    // Notify You
    logEvent('Candle Blown', { success: true });

    // Confetti
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    setTimeout(() => {
        nextScene('scene-gallery');
        if(fog) fog.style.display = 'none';
    }, 2500);
}

/* =========================================
   4. SCENE SWITCHER & UTILS
   ========================================= */
window.nextScene = function(sceneId) {
    document.querySelectorAll('.scene').forEach(s => {
        s.classList.remove('active');
        setTimeout(() => s.classList.add('hidden'), 1000); 
    });
    
    const next = document.getElementById(sceneId);
    if(next) {
        next.classList.remove('hidden');
        setTimeout(() => next.classList.add('active'), 50);

        // --- CANDLE LOCK LOGIC ---
        if (sceneId === 'scene-candle') {
            isCandleReady = false; // Lock immediately
            const wrapper = document.getElementById('candle-wrapper');
            const instruction = document.getElementById('candle-instruction');
            
            wrapper.classList.add('locked-state');
            instruction.innerHTML = "Wait for the magic...";
            
            // Unlock after 2.5 seconds
            setTimeout(() => {
                isCandleReady = true;
                wrapper.classList.remove('locked-state');
                instruction.innerHTML = "Make a wish...<br><strong>CLICK the flame!</strong>";
            }, 2500);
        }

        if (sceneId === 'scene-letter') {
            logEvent('Reading Letter', {});
            setTimeout(startTypewriter, 1000);
        }
        if (sceneId === 'scene-finale') startCountdown();
    }
};

// Reaction Buttons
window.sendReaction = function(emoji) {
    logEvent('Reaction Sent', { emoji: emoji });
    alert(`Sent ${emoji} to Adetayo!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
};

window.openModal = (src) => {
    document.getElementById('image-modal').classList.remove('hidden');
    document.getElementById('modal-img').src = src;
    logEvent('Viewed Photo', { src: src });
};
window.closeModal = () => {
    document.getElementById('image-modal').classList.add('hidden');
};

/* =========================================
   5. TYPEWRITER & COUNTDOWN
   ========================================= */
const letterText = `So here we are. I built this because you're annoying and amazing... mostly amazing. I hope Greece is treating you well. But don't enjoy it too much, we have to celebrate properly when you return. This isn't just code, it's a little piece of my heart. Happy Birthday, Yvana.`;

function startTypewriter() {
    const el = document.getElementById('typewriter-text');
    const voice = document.getElementById('voice-audio');
    el.innerHTML = "";
    
    bgMusic.volume = 0.2;
    voice.play().catch(e => console.log("Voice error"));
    
    let i = 0;
    function type() {
        if (i < letterText.length) {
            el.innerHTML += letterText.charAt(i) === '\n' ? '<br>' : letterText.charAt(i);
            i++;
            setTimeout(type, 50);
        } else {
            setTimeout(() => { bgMusic.volume = 0.5; }, 2000);
        }
    }
    type();
}

function startCountdown() {
    const target = new Date("December 12, 2025 00:00:00").getTime();
    setInterval(() => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff > 0) {
            document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
            document.getElementById('hours').innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('mins').innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('secs').innerText = Math.floor((diff % (1000 * 60)) / 1000);
        }
    }, 1000);
}

const cursorTrail = document.getElementById('cursor-trail');
document.addEventListener('mousemove', (e) => {
    cursorTrail.style.left = e.clientX + 'px';
    cursorTrail.style.top = e.clientY + 'px';
});