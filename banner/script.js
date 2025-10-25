// Cargar items desde archivos .md o usar datos de ejemplo
async function loadBannerItems() {
  try {
    // Intentar cargar desde content/banner/
    const response = await fetch('content/banner/');
    const files = await response.text();
    
    // Parsear archivos .md (implementar según tu sistema)
    // Por ahora usamos datos de ejemplo
    return getExampleData();
  } catch (error) {
    console.log('Usando datos de ejemplo');
    return getExampleData();
  }
}

function getExampleData() {
  return [
    { image: 'https://assets.codepen.io/16327/portrait-number-01.png', order: 1 },
    { image: 'https://assets.codepen.io/16327/portrait-number-02.png', order: 2 },
    { image: 'https://assets.codepen.io/16327/portrait-number-03.png', order: 3 },
    { image: 'https://assets.codepen.io/16327/portrait-number-04.png', order: 4 },
    { image: 'https://assets.codepen.io/16327/portrait-number-05.png', order: 5 },
    { image: 'https://assets.codepen.io/16327/portrait-number-06.png', order: 6 },
    { image: 'https://assets.codepen.io/16327/portrait-number-07.png', order: 7 },
  ];
}

// Inicializar carrusel
async function initCarousel() {
  const items = await loadBannerItems();
  const cardsList = document.getElementById('cardsList');
  
  // Crear cards (duplicadas para loop infinito)
  [...items, ...items].forEach(item => {
    const li = document.createElement('li');
    li.style.backgroundImage = `url(${item.image})`;
    cardsList.appendChild(li);
  });
  
  // Iniciar animación GSAP
  startAnimation();
}

function startAnimation() {
  gsap.registerPlugin(ScrollTrigger);
  
  const spacing = 0.15; // Ajustado para banner horizontal
  const cards = gsap.utils.toArray('.cards li');
  
  // Estado inicial
  gsap.set('.cards li', {xPercent: 500, opacity: 0, scale: 0.5});
  
  const animateFunc = element => {
    const tl = gsap.timeline();
    tl.fromTo(element, 
      {scale: 0.5, opacity: 0}, 
      {scale: 1, opacity: 1, zIndex: 100, duration: 0.6, yoyo: true, repeat: 1, ease: "power2.inOut", immediateRender: false}
    ).fromTo(element, 
      {xPercent: 500}, 
      {xPercent: -500, duration: 1.2, ease: "none", immediateRender: false}, 
      0
    );
    return tl;
  };
  
  const seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc);
  const playhead = {offset: 0};
  const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration());
  
  // Auto-play continuo
  gsap.to(playhead, {
    offset: seamlessLoop.duration(),
    duration: seamlessLoop.duration() * 4, // Velocidad (aumentar número = más lento)
    ease: "none",
    repeat: -1,
    onUpdate() {
      seamlessLoop.time(wrapTime(playhead.offset));
    }
  });
}

function buildSeamlessLoop(items, spacing, animateFunc) {
  let overlap = Math.ceil(1 / spacing);
  let startTime = items.length * spacing + 0.5;
  let loopTime = (items.length + overlap) * spacing + 1;
  let rawSequence = gsap.timeline({paused: true});
  let seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      this._time === this._dur && (this._tTime += this._dur - 0.01);
    }
  });
  
  let l = items.length + overlap * 2;
  
  for (let i = 0; i < l; i++) {
    let index = i % items.length;
    let time = i * spacing;
    rawSequence.add(animateFunc(items[index]), time);
    i <= items.length && seamlessLoop.add("label" + i, time);
  }
  
  rawSequence.time(startTime);
  seamlessLoop.to(rawSequence, {
    time: loopTime,
    duration: loopTime - startTime,
    ease: "none"
  }).fromTo(rawSequence, 
    {time: overlap * spacing + 1}, 
    {
      time: startTime,
      duration: startTime - (overlap * spacing + 1),
      immediateRender: false,
      ease: "none"
    }
  );
  
  return seamlessLoop;
}

// Iniciar cuando cargue la página
window.addEventListener('DOMContentLoaded', initCarousel);
