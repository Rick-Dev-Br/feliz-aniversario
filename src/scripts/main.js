const BIRTHDAY_MONTH_INDEX = 5;
const BIRTHDAY_DAY = 29;
const BIRTHDAY_END_HOUR = 23;
const BIRTHDAY_END_MINUTE = 59;
const BIRTHDAY_END_SECOND = 59;
const BIRTHDAY_END_MS = 999;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function getBirthdayForYear(year) {
    return new Date(year, BIRTHDAY_MONTH_INDEX, BIRTHDAY_DAY, 0, 0, 0);
}

function getBirthdayEndForYear(year) {
    return new Date(
        year,
        BIRTHDAY_MONTH_INDEX,
        BIRTHDAY_DAY,
        BIRTHDAY_END_HOUR,
        BIRTHDAY_END_MINUTE,
        BIRTHDAY_END_SECOND,
        BIRTHDAY_END_MS
    );
}

function isBirthdayToday(date) {
    return date.getMonth() === BIRTHDAY_MONTH_INDEX && date.getDate() === BIRTHDAY_DAY;
}

function getNextBirthdayDate(fromDate) {
    const currentYear = fromDate.getFullYear();
    const birthday = getBirthdayForYear(currentYear);
    const birthdayEnd = getBirthdayEndForYear(currentYear);

    if (fromDate > birthdayEnd) {
        return getBirthdayForYear(currentYear + 1);
    }

    return birthday;
}

function setupCarousel() {
    const carousel = document.querySelector('.carousel');
    const slides = document.querySelectorAll('.carousel-slide');
    const buttons = document.querySelectorAll('.carousel-btn');
    const quotes = document.querySelectorAll('.quote');

    if (!carousel || !slides.length) {
        return;
    }

    let currentIndex = 0;
    let carouselTimer = null;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

        buttons.forEach((button, index) => {
            button.classList.toggle('active', index === currentIndex);
            button.setAttribute('aria-current', index === currentIndex ? 'true' : 'false');
        });

        quotes.forEach((quote, index) => {
            quote.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    function startAutoCarousel() {
        if (prefersReducedMotion.matches || slides.length <= 1 || carouselTimer) {
            return;
        }

        carouselTimer = setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }, 6000);
    }

    function stopAutoCarousel() {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            goToSlide(index);
            stopAutoCarousel();
            startAutoCarousel();
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoCarousel();
            return;
        }

        startAutoCarousel();
    });

    updateCarousel();
    startAutoCarousel();
}

const daysElem = document.getElementById('days');
const hoursElem = document.getElementById('hours');
const minutesElem = document.getElementById('minutes');
const secondsElem = document.getElementById('seconds');
const specialMessage = document.getElementById('specialMessage');
const congratsTitle = document.getElementById('congratsTitle');
let hasStartedCelebration = false;

function updateCountdownValue(element, value) {
    if (element) {
        element.textContent = value.toString().padStart(2, '0');
    }
}

function showCelebration() {
    updateCountdownValue(daysElem, 0);
    updateCountdownValue(hoursElem, 0);
    updateCountdownValue(minutesElem, 0);
    updateCountdownValue(secondsElem, 0);

    if (congratsTitle) {
        congratsTitle.textContent = 'Parabéns!';
        congratsTitle.classList.add('celebrating');
    }

    if (specialMessage) {
        specialMessage.classList.add('show');
    }

    if (!hasStartedCelebration) {
        hasStartedCelebration = true;
        createFireworks();
    }
}

function updateCountdown() {
    const now = new Date();

    if (isBirthdayToday(now)) {
        showCelebration();
        return;
    }

    const birthdayDate = getNextBirthdayDate(now);
    const difference = birthdayDate - now;

    if (difference <= 0) {
        showCelebration();
        return;
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    updateCountdownValue(daysElem, days);
    updateCountdownValue(hoursElem, hours);
    updateCountdownValue(minutesElem, minutes);
    updateCountdownValue(secondsElem, seconds);

    if (congratsTitle && days === 0 && hours === 0 && minutes < 1) {
        congratsTitle.classList.add('celebrating');
    }
}

const COLORS = [
    '#ffd782',
    '#fff8ef',
    '#f28a63',
    '#d84d6b',
    '#9be7ff',
    '#b8f7c9'
];
const MAX_EXPLOSIONS = 8;
const PARTICLE_COUNT = 44;
const EXPLOSION_DURATION = 1500;

let canvas = null;
let ctx = null;
let animationFrameId = null;
let fireworksIntervalId = null;
let fireworksTimeoutId = null;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 1.5;
        this.size = Math.random() * 3 + 1.5;
        this.alpha = 1;
        this.decay = 0.018;
        this.gravity = 0.035;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ExplosionManager {
    constructor() {
        this.activeExplosions = [];
    }

    createExplosion(x, y) {
        if (this.activeExplosions.length >= MAX_EXPLOSIONS) {
            return;
        }

        const particles = [];

        for (let index = 0; index < PARTICLE_COUNT; index++) {
            particles.push(new Particle(x, y));
        }

        this.activeExplosions.push({
            particles,
            createdAt: Date.now()
        });
    }

    hasActiveExplosions() {
        return this.activeExplosions.length > 0;
    }

    update() {
        for (let index = this.activeExplosions.length - 1; index >= 0; index--) {
            const explosion = this.activeExplosions[index];
            let activeParticles = 0;

            explosion.particles.forEach((particle) => {
                if (particle.update()) {
                    activeParticles++;
                }
            });

            const isExpired = Date.now() - explosion.createdAt > EXPLOSION_DURATION;

            if (activeParticles === 0 || isExpired) {
                this.activeExplosions.splice(index, 1);
            }
        }
    }

    draw() {
        if (!ctx || !canvas) {
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.activeExplosions.forEach((explosion) => {
            explosion.particles.forEach((particle) => particle.draw());
        });
        ctx.globalAlpha = 1;
    }
}

const explosionManager = new ExplosionManager();

function resizeCanvas() {
    if (!canvas || !ctx) {
        return;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function setupFireworksCanvas() {
    if (canvas) {
        return;
    }

    canvas = document.createElement('canvas');
    canvas.className = 'fireworks-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
}

function animateFireworks() {
    explosionManager.update();
    explosionManager.draw();

    if (!explosionManager.hasActiveExplosions() && !fireworksIntervalId) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(animateFireworks);
}

function startFireworksLoop() {
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateFireworks);
    }
}

function createFireworks() {
    if (prefersReducedMotion.matches || fireworksIntervalId) {
        return;
    }

    setupFireworksCanvas();

    function addRandomExplosion() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.62;
        explosionManager.createExplosion(x, y);
        startFireworksLoop();
    }

    addRandomExplosion();
    fireworksIntervalId = setInterval(addRandomExplosion, 700);

    clearTimeout(fireworksTimeoutId);
    fireworksTimeoutId = setTimeout(() => {
        clearInterval(fireworksIntervalId);
        fireworksIntervalId = null;
    }, 18000);
}

const backgroundMusic = document.getElementById('backgroundMusic');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = playPauseBtn ? playPauseBtn.querySelector('span') : null;
const volumeSlider = document.getElementById('volume-slider');

function setMusicButtonState(isPlaying) {
    if (!playPauseBtn || !playPauseIcon) {
        return;
    }

    playPauseIcon.textContent = isPlaying ? '❚❚' : '▶';
    playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Tocar música');
}

function showMusicPrompt() {
    if (document.getElementById('music-prompt')) {
        return;
    }

    const prompt = document.createElement('div');
    prompt.id = 'music-prompt';
    prompt.textContent = 'Toque no botão para ativar a música.';
    document.body.appendChild(prompt);

    setTimeout(() => {
        prompt.remove();
    }, 4500);
}

function toggleMusic() {
    if (!backgroundMusic || !playPauseBtn) {
        return;
    }

    if (backgroundMusic.paused) {
        backgroundMusic.play()
            .then(() => setMusicButtonState(true))
            .catch(() => {
                setMusicButtonState(false);
                showMusicPrompt();
            });
        return;
    }

    backgroundMusic.pause();
    setMusicButtonState(false);
}

function setupMusicControls() {
    if (!backgroundMusic || !playPauseBtn || !volumeSlider) {
        return;
    }

    backgroundMusic.volume = Number(volumeSlider.value);
    setMusicButtonState(false);

    playPauseBtn.addEventListener('click', toggleMusic);
    volumeSlider.addEventListener('input', () => {
        backgroundMusic.volume = Number(volumeSlider.value);
    });
}

function init() {
    setupCarousel();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    setupMusicControls();
}

document.addEventListener('DOMContentLoaded', init);
