// Adicione esta função para ajustar dinamicamente a altura dos slides
function adjustSlideHeight() {
    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    
    // Reset para todos os dispositivos
    slides.forEach(slide => {
        slide.style.height = '';
    });

    if (carouselContainer) {
        if (window.innerWidth > 900) {
            slides.forEach(slide => {
                slide.style.height = carouselContainer.offsetHeight + 'px';
            });
        } else {
            // Manter altura automática em mobile
            slides.forEach(slide => {
                slide.style.height = '';
            });
        }
    }
}

// ADICIONE ESTE EVENT LISTENER PARA INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {

    adjustSlideHeight();
    initCarousel();
    
    // Restante da inicialização...
});

// Chame a função ao carregar e ao redimensionar a janela
window.addEventListener('DOMContentLoaded', () => {
    adjustSlideHeight();
    // Restante da inicialização...
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustSlideHeight(); // Chama a função de ajuste
});

// Configuração do carrossel
const carousel = document.querySelector('.carousel');
const slides = document.querySelectorAll('.carousel-slide');
const buttons = document.querySelectorAll('.carousel-btn');
const quotes = document.querySelectorAll('.quote');
let currentIndex = 0;

// Inicializar o carrossel
function initCarousel() {
    adjustSlideHeight(); // Usa a função global já existente
    updateCarousel();
}

function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Atualiza botões ativos
    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index === currentIndex);
    });
    
    // Atualiza frases ativas
    quotes.forEach((quote, index) => {
        quote.classList.toggle('active', index === currentIndex);
    });
}

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
});

// Mudança automática a cada 5 segundos
setInterval(() => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
}, 5000);

// Sistema de fogos de artifício (usando Canvas para melhor performance)
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reajustar altura dos slides em dispositivos móveis
    if (window.innerWidth <= 900) {
        const carouselContainer = document.querySelector('.carousel-container');
        slides.forEach(slide => {
            slide.style.height = carouselContainer.offsetHeight + 'px';
        });
    }
});

// Pool de cores fixa
const COLORS = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00',
    '#00ffff', '#ff00ff', '#ff9900', '#ff0099'
];

// Estrutura de dados para partículas
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 5 + 2;
        this.size = Math.random() * 4 + 2;
        this.alpha = 1;
        this.decay = 0.015;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
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

// Gerenciador de explosões
class ExplosionManager {
    constructor() {
        this.activeExplosions = [];
    }

    createExplosion(x, y) {
        if (this.activeExplosions.length >= MAX_EXPLOSIONS) return;

        const particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle(x, y));
        }

        this.activeExplosions.push({
            particles,
            createdAt: Date.now()
        });
    }

    update() {
        for (let i = this.activeExplosions.length - 1; i >= 0; i--) {
            const explosion = this.activeExplosions[i];
            let activeParticles = 0;

            for (const particle of explosion.particles) {
                if (particle.update()) activeParticles++;
            }

            const isExpired = Date.now() - explosion.createdAt > EXPLOSION_DURATION;
            if (activeParticles === 0 || isExpired) {
                this.activeExplosions.splice(i, 1);
            }
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const explosion of this.activeExplosions) {
            for (const particle of explosion.particles) {
                particle.draw();
            }
        }
    }
}

// Configurações
const MAX_EXPLOSIONS = 15;
const PARTICLE_COUNT = 70;
const EXPLOSION_DURATION = 2000;
const explosionManager = new ExplosionManager();

// Função para criar fogos de artifício
function createFireworks() {
    // Criar fogos aleatórios pela tela
    const interval = setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        explosionManager.createExplosion(x, y);
    }, 500);
    
    // Parar após 30 segundos (para não sobrecarregar)
    setTimeout(() => clearInterval(interval), 30000);
}

// Contador Regressivo para o Aniversário - CORRIGIDO
const birthdayDate = new Date(2025, 5, 29, 0, 0, 0); // Forma correta de criar a data

const daysElem = document.getElementById('days');
const hoursElem = document.getElementById('hours');
const minutesElem = document.getElementById('minutes');
const secondsElem = document.getElementById('seconds');
const specialMessage = document.getElementById('specialMessage');

// Função updateCountdown ÚNICA e COMPLETA
function updateCountdown() {
    const now = new Date();
    const difference = birthdayDate - now;
    
    // Se a data já passou
    if (difference <= 0) {
        daysElem.textContent = '00';
        hoursElem.textContent = '00';
        minutesElem.textContent = '00';
        secondsElem.textContent = '00';
        
        // Mostrar mensagem especial
        specialMessage.classList.add('show');
        
        // Ativar fogos de artifício
        createFireworks();
        return;
    }
    
    // Cálculos de tempo
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Atualizar elementos
    daysElem.textContent = days.toString().padStart(2, '0');
    hoursElem.textContent = hours.toString().padStart(2, '0');
    minutesElem.textContent = minutes.toString().padStart(2, '0');
    secondsElem.textContent = seconds.toString().padStart(2, '0');
    
    // Se faltar menos de 1 minuto, animação especial
    if (days === 0 && hours === 0 && minutes < 1) {
        document.querySelector('.congrats-title').style.animation = 'pulse 0.5s infinite';
    }
}

// Iniciar contador
updateCountdown();
setInterval(updateCountdown, 1000);

// Loop de animação
function animate() {
    explosionManager.update();
    explosionManager.draw();
    requestAnimationFrame(animate);
}
animate();

// Sistema de música de fundo
const backgroundMusic = document.getElementById('backgroundMusic');
const playPauseBtn = document.getElementById('play-pause-btn');
const volumeSlider = document.getElementById('volume-slider');
let musicStarted = false;

// Função para iniciar/pausar música
function toggleMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        backgroundMusic.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Configurar controles de música
function setupMusicControls() {
    // Evento play/pause
    playPauseBtn.addEventListener('click', toggleMusic);
    
    // Evento de volume
    volumeSlider.addEventListener('input', () => {
        backgroundMusic.volume = volumeSlider.value;
    });
    
    // Verificar suporte a autoplay
    backgroundMusic.play()
        .then(() => {
            musicStarted = true;
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        })
        .catch(error => {
            console.log("Autoplay bloqueado:", error);
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            showMusicPrompt();
        });
}

// Mostrar prompt se autoplay bloqueado
function showMusicPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'music-prompt';
    prompt.innerHTML = 'Clique no botão play para ativar a música';
    prompt.style.position = 'fixed';
    prompt.style.bottom = '80px';
    prompt.style.right = '20px';
    prompt.style.backgroundColor = 'rgba(0,0,0,0.7)';
    prompt.style.color = 'white';
    prompt.style.padding = '10px';
    prompt.style.borderRadius = '5px';
    prompt.style.zIndex = '10000';
    prompt.style.fontSize = '0.9rem';
    
    document.body.appendChild(prompt);
    
    // Remover após 5 segundos
    setTimeout(() => {
        prompt.remove();
    }, 5000);
}

// Iniciar controles
setupMusicControls();

// Inicializar o carrossel quando a página carregar
window.addEventListener('DOMContentLoaded', initCarousel);