// Texto digitado, inspirado no TextType do React Bits: <p data-text-type="Frase 1|Frase 2" data-tt-delay="ms">
// Sem valor no atributo, usa o próprio texto. Uma frase: digita uma vez e o cursor fica piscando.
// Várias frases: digita, pausa, apaga e passa para a próxima, em loop. Começa quando o elemento fica visível.
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const TYPE = 60, DELETE = 30, PAUSE = 2000;
  const signal = window.PF && PF.signal;   // navegação suave (site.js): o loop para quando a página sai
  const gone = () => signal && signal.aborted;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function setup(el) {
    const texts = (el.dataset.textType || el.textContent).split('|').map(s => s.trim()).filter(Boolean);
    if (!texts.length) return;
    const sr = document.createElement('span'), out = document.createElement('span'), cur = document.createElement('span');
    sr.className = 'sr-only'; sr.textContent = texts.join(', ');
    out.className = 'text-type__content'; out.setAttribute('aria-hidden', 'true');
    cur.className = 'text-type__cursor'; cur.setAttribute('aria-hidden', 'true'); cur.textContent = '|';
    el.textContent = '';
    el.append(sr, out, cur);

    async function play() {
      await wait(+el.dataset.ttDelay || 0);
      for (let i = 0; ; i = (i + 1) % texts.length) {
        const t = texts[i];
        el.classList.add('is-typing');
        for (let n = 1; n <= t.length; n++) { if (gone()) return; out.textContent = t.slice(0, n); await wait(TYPE); }
        el.classList.remove('is-typing');
        if (texts.length === 1) return;
        await wait(PAUSE);
        el.classList.add('is-typing');
        for (let n = t.length - 1; n >= 0; n--) { if (gone()) return; out.textContent = t.slice(0, n); await wait(DELETE); }
      }
    }

    // Mesma margem do reveal (site.js), para a digitação sair junto com o fade do elemento
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); play(); } }, { rootMargin: '0px 0px -6% 0px' });
    io.observe(el);
    if (signal) signal.addEventListener('abort', () => io.disconnect());
  }

  document.querySelectorAll('[data-text-type]').forEach(setup);
})();
