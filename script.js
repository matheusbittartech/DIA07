const heartCanvas = document.getElementById('heartCanvas');
const ctx = heartCanvas.getContext('2d');
let hearts = [];
let animationId = null;
let heartsActivated = false;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  heartCanvas.width = window.innerWidth;
  heartCanvas.height = window.innerHeight;
}

function createHeart() {
  return {
    x: Math.random() * heartCanvas.width,
    y: heartCanvas.height + Math.random() * heartCanvas.height,
    size: Math.random() * 18 + 12,
    speed: Math.random() * 1.5 + 0.8,
    wobble: Math.random() * 2 + 1,
    wobbleSpeed: Math.random() * 0.04 + 0.02,
    alpha: Math.random() * 0.6 + 0.2,
  };
}

function drawHeart({ x, y, size, alpha }) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + size / 2, y - size, x + size * 1.4, y + size / 3, x, y + size);
  ctx.bezierCurveTo(x - size * 1.4, y + size / 3, x - size / 2, y - size, x, y);
  ctx.fillStyle = `rgba(255, 126, 194, ${alpha})`;
  ctx.fill();
  ctx.restore();
}

function animateHearts() {
  if (!heartsActivated) {
    ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    return;
  }

  ctx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);

  hearts.forEach((heart) => {
    heart.y -= heart.speed;
    heart.x += Math.sin(heart.y * heart.wobbleSpeed) * heart.wobble;

    if (heart.y < -heart.size) {
      Object.assign(heart, createHeart(), { y: heartCanvas.height + heart.size });
    }

    drawHeart(heart);
  });

  animationId = requestAnimationFrame(animateHearts);
}

function startHearts() {
  if (prefersReducedMotion || heartsActivated) {
    return;
  }

  heartsActivated = true;
  resizeCanvas();
  hearts = Array.from({ length: 60 }, createHeart);
  window.addEventListener('resize', resizeCanvas);
  animateHearts();
}

function typeText(element, text) {
  return new Promise((resolve) => {
    let index = 0;

    function type() {
      if (index <= text.length) {
        element.textContent = text.slice(0, index);
        index += 1;
        setTimeout(type, 32);
      } else {
        resolve();
      }
    }

    type();
  });
}

async function writeLetter(messageContainer, paragraphs) {
  messageContainer.innerHTML = '';
  messageContainer.classList.add('is-visible');

  for (const paragraph of paragraphs) {
    const p = document.createElement('p');
    p.classList.add('letter__line');
    messageContainer.appendChild(p);
    await typeText(p, paragraph);
  }
}

function initRevealAnimation() {
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );

  revealElements.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initRevealAnimation();

  const openLetterButton = document.getElementById('open-letter');
  const letterEnvelope = document.querySelector('.letter__envelope');
  const letterMessage = document.getElementById('letterMessage');
  const letterSection = document.getElementById('carta');

  const paragraphs = [
    'Princesa, passando para agradecer por esses 11 meses ao teu lado e lembrar que eu te amo infinitamente.',
    'Você é minha melhor companhia, a pessoa com quem eu amo dividir cada momento e cada sonho. Olho para o que já vivemos e sinto orgulho de quem me tornei desde que te conheci.',
    'Lembro de Gramado e de como você roubou toda a beleza daquele lugar. Ali eu tive a certeza: eu estava — e sigo — cada vez mais apaixonado por você.',
    'Eu acredito — e sei — que você vai ser a melhor médica de todas. Confia, acredita e segue na fé, porque essa aprovação já é tua.',
    'Te admiro demais, minha cueia sapecuda. Obrigado por ser minha casa, meu riso e minha paz. Feliz nosso dia 07!'
  ];

  let hasOpenedLetter = false;

  openLetterButton.addEventListener('click', () => {
    if (hasOpenedLetter) {
      letterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    hasOpenedLetter = true;
    openLetterButton.disabled = true;
    openLetterButton.textContent = 'Carta aberta com amor';

    letterEnvelope.classList.add('is-open');
    letterSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    startHearts();
    writeLetter(letterMessage, paragraphs);
  });
});

