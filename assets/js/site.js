// Comportamentos compartilhados: nav, menu mobile, cortina, reveal, parallax, image-slot, footer.
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.22,.61,.36,1)';
  const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const LINKS = [
    { id: 'inicio', label: 'Início', href: 'index.html', num: '01' },
    { id: 'sobre', label: 'Sobre mim', href: 'sobre.html', num: '02' },
    { id: 'projetos', label: 'Projetos', href: 'projetos.html', num: '03' }
  ];
  const page = document.body.dataset.page || 'inicio';
  // Vida da página atual: os scripts de página registram listeners com { signal: PF.signal }; na navegação suave
  // o sinal é abortado e eles saem junto com o <main> antigo
  let pageCtl = new AbortController();

  /* ---------- Logo: usa imagem se existir, senão wordmark ---------- */
  function logo(cls, file) {
    return `<img src="assets/img/logos/${file}" alt="Giovanni Nespoli" onerror="this.outerHTML='<span class=&quot;wordmark&quot;>Giovanni Nespoli</span>'">`;
  }

  /* ---------- Nav + menu + cortina ---------- */
  function renderNav() {
    const li = LINKS.map(l => `<li class="${l.id === page ? 'is-active' : ''}"><a href="${l.href}" ${l.id === page ? 'aria-current="page"' : ''}>${l.label}</a></li>`).join('');
    const mli = LINKS.map(l => `<li><a href="${l.href}" ${l.id === page ? 'aria-current="page"' : ''}><span>${l.label}</span><span>${l.num}</span></a></li>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `
      <a class="skip" href="#conteudo">Pular para o conteúdo</a>
      <header class="nav"><div class="nav__in">
        <a class="nav__logo" href="index.html" aria-label="Giovanni Nespoli — Início">${logo('', 'logo-b.webp')}</a>
        <nav class="nav__desk" aria-label="Principal">
          <ul class="nav__links">${li}</ul>
          <!-- MODO ESCURO (desativado por enquanto)
          <button type="button" class="btn-ghost" data-theme-toggle aria-pressed="${isDark()}">${isDark() ? 'Modo claro' : 'Modo escuro'}</button> -->
          <a class="btn btn--solid btn--sm" href="#contato">Vamos conversar</a>
        </nav>
        <button type="button" class="nav__menu-btn" id="menu-open" aria-expanded="false" aria-controls="menu-mobile">Menu</button>
      </div></header>
      <div class="menu" id="menu-mobile" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
        <div class="menu__top"><span class="wordmark">Nespoli</span>
          <!-- MODO ESCURO (desativado): <button type="button" data-theme-toggle ...> -->
          <button type="button" id="menu-close">Fechar</button></div>
        <nav aria-label="Principal (celular)"><ul>${mli}</ul></nav>
        <a class="menu__cta" href="#contato">Vamos conversar</a>
      </div>
      <div class="curtain" aria-hidden="true"><span>Nespoli</span></div>`);
    $('main').insertAdjacentHTML('beforebegin', '<div class="nav-spacer" aria-hidden="true"></div>');

    const menu = $('#menu-mobile'), openBtn = $('#menu-open');
    const setMenu = open => {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      openBtn.setAttribute('aria-expanded', String(open));
      $$('a,button', menu).forEach(el => el.tabIndex = open ? 0 : -1);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) setTimeout(() => $('#menu-close').focus(), 60);
    };
    setMenu(false);
    openBtn.addEventListener('click', () => setMenu(true));
    $('#menu-close').addEventListener('click', () => setMenu(false));
    $('.menu__cta').addEventListener('click', () => setMenu(false));
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth >= 860) setMenu(false); });

    $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
      const dark = !isDark();
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      try { localStorage.setItem('pf-theme', dark ? 'dark' : 'light'); } catch (e) {}
      $$('[data-theme-toggle]').forEach(x => { x.textContent = dark ? 'Modo claro' : 'Modo escuro'; x.setAttribute('aria-pressed', String(dark)); });
      
      dispatchEvent(new CustomEvent('pf-theme', { detail: dark }));
    }));

    // Cortina entre páginas
    const c = $('.curtain');
    let flag = null;
    try { flag = sessionStorage.getItem('pf-curtain'); sessionStorage.removeItem('pf-curtain'); } catch (e) {}
    if (flag === '1' && !reduce) {
      c.style.transform = 'translateY(0)';
      // Só começa a sair depois do primeiro frame de fato exibido (o render da página nova pode ficar suspenso
      // pela View Transition ou pelo paint holding); assim a saída não "começa pela metade".
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const a = c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 650, delay: 100, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' });
        a.onfinish = () => { c.style.transform = 'translateY(100%)'; a.cancel(); };
      }));
    }
    // A cortina real já está no lugar: tira a cópia do <head> (theme.js) no mesmo frame
    document.documentElement.classList.remove('pf-curtain');
    addEventListener('pageshow', e => { if (e.persisted) { c.getAnimations().forEach(a => a.cancel()); c.style.transform = 'translateY(100%)'; document.documentElement.classList.remove('pf-leaving'); } });

    /* ---------- Navegação suave: troca só o <main>, sem trocar de documento ----------
       Entre dois documentos o navegador pinta a janela por conta própria por alguns quadros (no Arc, ~80ms de creme
       liso), e nada na página controla esse vão. Aqui a cortina cobre, o <main> da próxima página entra por baixo,
       os scripts dela rodam e a cortina sai: sem troca de documento, sem vão. Qualquer falha cai na navegação normal. */
    // Aba oculta não avança o relógio das animações: aí pula direto para o estado final. O limite de tempo garante
    // que a navegação nunca fique presa esperando uma animação.
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const animate = (kf, o) => document.hidden ? Promise.resolve()
      : Promise.race([c.animate(kf, o).finished.catch(() => {}), wait(o.duration + (o.delay || 0) + 400)]);
    const ease = 'cubic-bezier(.76,0,.24,1)';
    const cover = () => animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: ease, fill: 'forwards' })
      .then(() => { c.style.transform = 'translateY(0)'; });
    const uncover = () => animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 650, delay: 100, easing: ease, fill: 'forwards' })
      .then(() => { c.style.transform = 'translateY(100%)'; c.getAnimations().forEach(a => a.cancel()); });
    const pageKey = u => { const x = new URL(u, location.href); return x.pathname + x.search; };
    const isPageLink = a => a && a.origin === location.origin && a.target !== '_blank' && /\.html/.test(a.getAttribute('href') || '') && !(a.getAttribute('href') || '').startsWith('#');
    const pages = new Map();
    const getPage = u => {
      const k = pageKey(u);
      if (!pages.has(k)) pages.set(k, fetch(k).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).catch(err => { pages.delete(k); throw err; }));
      return pages.get(k);
    };
    const loadSheet = href => new Promise(res => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href; l.onload = l.onerror = res;
      document.head.appendChild(l); setTimeout(res, 3000);
    });
    async function runScripts(doc, base) {
      $$('body > script[src]').forEach(s => { if (!/\/site\.js/.test(s.src)) s.remove(); });
      for (const s of doc.querySelectorAll('body script[src]')) {
        const src = new URL(s.getAttribute('src'), base).href;
        if (/\/site\.js/.test(src)) continue;
        await new Promise(res => { const n = document.createElement('script'); n.src = src; n.onload = n.onerror = res; document.body.appendChild(n); });
      }
    }
    function markNav(id) {
      const desk = $$('.nav__links li'), mob = $$('#menu-mobile nav a');
      LINKS.forEach((l, i) => {
        const on = l.id === id;
        desk[i].classList.toggle('is-active', on);
        [desk[i].querySelector('a'), mob[i]].forEach(a => on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      });
    }
    // leitores de tela: o foco vai para o título da página nova (ou para o <main> se o título estiver oculto)
    const focusMain = () => { const h = $('main h1'), t = h && h.getClientRects().length ? h : $('main'); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); };

    let current = pageKey(location.href), busy = false, pending = false;
    async function go(url, { push = true, curtain = !reduce, y = 0 } = {}) {
      if (busy) return;
      busy = true;
      setMenu(false);
      try {
        const [html] = await Promise.all([getPage(url), curtain ? cover() : null]);
        const doc = new DOMParser().parseFromString(html, 'text/html'), main = doc.querySelector('main');
        if (!main) throw new Error('página sem <main>');
        // CSS da página nova carregado antes da troca (home.css x pages.css)
        const next = $$('link[rel="stylesheet"]', doc).map(l => new URL(l.getAttribute('href'), url).href), now = $$('link[rel="stylesheet"]');
        await Promise.all(next.filter(h => !now.some(l => l.href === h)).map(loadSheet));
        // sai a página atual: listeners dos scripts dela (PF.signal) e observadores de reveal
        pageCtl.abort(); pageCtl = new AbortController();
        if (push) {
          history.scrollRestoration = 'manual';
          history.replaceState({ ...(history.state || {}), y: scrollY }, '');
          history.pushState({ y: 0 }, '', url);
        }
        current = pageKey(url);
        document.title = doc.title;
        const desc = $('meta[name="description"]', doc), mine = $('meta[name="description"]');
        if (desc && mine) mine.content = desc.content; else if (desc) document.head.appendChild(desc.cloneNode()); else if (mine) mine.remove();
        document.body.dataset.page = doc.body.dataset.page || 'inicio';
        $('main').replaceWith(document.adoptNode(main));
        now.forEach(l => { if (!next.includes(l.href)) l.remove(); });
        pruneReveal();
        markNav(document.body.dataset.page);
        scrollTo({ top: y, behavior: 'instant' });
        await runScripts(doc, url);
        initSlots(); scanReveal();
        await PF.data;   // páginas que montam conteúdo a partir do JSON já renderizaram (a âncora #... fica no lugar certo)
        const hash = new URL(url, location.href).hash;
        if (hash) { const t = document.getElementById(decodeURIComponent(hash.slice(1))); if (t) t.scrollIntoView({ behavior: 'instant' }); }
        // Voltar: o scrollTo lá de cima rodou com a página ainda vazia (a galeria só é desenhada depois do JSON) e foi
        // limitado ao tamanho curto dela; com o conteúdo já montado, a posição de antes volta a existir
        else if (y) scrollTo({ top: y, behavior: 'instant' });
        focusMain();
        if (curtain) await uncover();
      } catch (err) {
        // falhou (rede, 404, HTML inesperado): navegação normal; a página nova abre com a cópia da cortina (theme.js)
        try { sessionStorage.setItem('pf-curtain', '1'); } catch (e) {}
        document.documentElement.classList.add('pf-leaving');
        location.href = url;
        return;
      } finally { busy = false; }
      if (pending) { pending = false; if (pageKey(location.href) !== current) go(location.href, { push: false, curtain: false }); }
    }

    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !isPageLink(a)) return;
      e.preventDefault();
      document.body.style.overflow = '';
      go(a.href);
    });
    // voltar/avançar: troca direto, sem cortina (como o navegador faria), restaurando a rolagem daquela entrada
    addEventListener('popstate', e => {
      if (pageKey(location.href) === current) return;   // só mudou o #hash
      if (busy) { pending = true; return; }
      go(location.href, { push: false, curtain: false, y: (e.state && e.state.y) || 0 });
    });
    // pré-carrega o HTML ao passar o mouse/focar um link, para a troca acontecer assim que a cortina cobre
    const prefetch = e => { const a = e.target.closest && e.target.closest('a[href]'); if (isPageLink(a)) getPage(a.href).catch(() => {}); };
    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('focusin', prefetch);
  }

  /* ---------- Footer / contato (dados em data/portfolio-data.json) ---------- */
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    curriculo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>'
  };
  function renderFooter(contato) {
    // [chave, rótulo (ícone + leitor de tela), href, texto do link]; só o e-mail mostra o próprio valor
    const defs = [
      ['email', 'E-mail', v => 'mailto:' + v, v => v],
      ['linkedin', 'LinkedIn', v => v, () => 'LinkedIn'],
      ['github', 'GitHub', v => v, () => 'GitHub'],
      ['curriculo', 'Currículo', v => v, () => 'Currículo']
    ];
    const items = defs.map(([k, label, href, show]) => {
      const v = (contato[k] || '').trim();
      const body = v
        ? `<a href="${esc(href(v))}" ${k === 'email' ? '' : 'target="_blank" class="is-caps"'} rel="noopener">${esc(show(v))} ↗</a>`
        : `<span class="tbd">a definir · contato.${k}</span>`;
      return `<li data-reveal="up"><span class="foot__ico" role="img" aria-label="${label}">${ICONS[k]}</span>${body}</li>`;
    }).join('');
    const f = $('#contato');
    f.innerHTML = `<div class="foot__in">
      <span class="eyebrow" data-reveal="up">Contato e contratação</span>
      <h2><span class="line-mask"><span data-reveal="line">Vamos</span></span><span class="line-mask"><span class="light" data-reveal="line" data-delay="90">conversar.</span></span></h2>
      <div class="foot__cols">
        <p class="foot__txt" data-reveal="up">Estou aberto a oportunidades profissionais e a projetos em que interface, negócio e engenharia precisem andar juntos. Conte o contexto e o problema; a conversa começa por aí.</p>
        <ul class="foot__list">${items}</ul>
      </div>
      <div class="foot__logo">${logo('', 'logo-claro.webp')}</div>
      <div class="foot__bar"><span>© 2026 Giovanni Nespoli</span>
        <nav aria-label="Rodapé">${LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</nav></div>
    </div>`;
    scanReveal();
  }
  

  /* ---------- Image slots: <div class="img-slot" data-src data-label> ---------- */
  function initSlots(root = document) {
    $$('.img-slot:not([data-init])', root).forEach(el => {
      el.dataset.init = '1';
      const src = el.dataset.src, label = el.dataset.label || 'Imagem a definir';
      const empty = () => { el.classList.add('is-empty'); el.innerHTML = `<span>${esc(label)}<br><small>${esc(src || '')}</small></span>`; };
      if (!src) return empty();
      const img = new Image();
      img.alt = el.dataset.alt || '';
      img.decoding = 'async';
      img.onload = () => { el.classList.remove('is-empty'); el.innerHTML = ''; el.appendChild(img); };
      img.onerror = empty;
      img.src = src;
    });
  }

  /* ---------- Imagem de projeto direto no HTML ----------
     initSlots só insere o <img> depois que ele carrega, então a caixa fica vazia no meio da rolagem; aqui o <img>
     já nasce no markup. data-init="1" tira o slot do initSlots (ele trata como vazio todo .img-slot sem data-src).
     Sem o arquivo, onerror troca pelo mesmo placeholder tracejado de initSlots. */
  function img(src, { alt = '', label = 'Imagem a definir' } = {}) {
    return `<div class="img-slot" data-init="1"><img src="${esc(src)}" alt="${esc(alt)}" data-src="${esc(src)}" data-label="${esc(label)}" decoding="async" loading="eager" onerror="PF.missing(this)"></div>`;
  }
  function missing(im) {
    const el = im.closest('.img-slot');
    if (!el) return;
    el.classList.add('is-empty');
    el.innerHTML = `<span>${esc(im.dataset.label || 'Imagem a definir')}<br><small>${esc(im.dataset.src || '')}</small></span>`;
  }

  /* ---------- Reveal ---------- */
  let io, targets = new Map();
  const fromClip = el => el.dataset.from === 'left' ? 'inset(0 100% 0 0)' : el.dataset.from === 'right' ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)';
  function play(el) {
    const mobile = innerWidth < 720, k = mobile ? .7 : 1;
    const t = el.dataset.reveal, d = (+el.dataset.delay || 0) * k;
    if (t === 'line') {
      el.style.transform = '';
      el.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 850 * k, delay: d, easing: E, fill: 'backwards' });
    } else if (t === 'mask') {
      el.style.clipPath = '';
      el.animate([{ clipPath: fromClip(el) }, { clipPath: 'inset(0 0 0 0)' }], { duration: 900 * k, delay: d, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'backwards' });
    } else {
      el.style.opacity = ''; el.style.transform = '';
      el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 700 * k, delay: d, easing: E, fill: 'backwards' });
    }
  }
  function scanReveal() {
    if (reduce || !('IntersectionObserver' in window)) return;
    if (!io) io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      (targets.get(en.target) || []).forEach(play);
      targets.delete(en.target);
    }), { rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach(el => {
      if (el.dataset.rv) return;
      el.dataset.rv = '1';
      const t = el.dataset.reveal;
      if (t === 'line') el.style.transform = 'translateY(105%)';
      else if (t === 'mask') el.style.clipPath = fromClip(el);
      else { el.style.opacity = '0'; el.style.transform = 'translateY(18px)'; }
      const tgt = t === 'line' ? el.parentElement : el;
      if (!targets.has(tgt)) targets.set(tgt, []);
      targets.get(tgt).push(el);
      io.observe(tgt);
    });
  }

  // depois de trocar o <main>: para de observar o que saiu da página (o rodapé, que fica, continua observado)
  function pruneReveal() {
    targets.forEach((els, tgt) => { if (!tgt.isConnected) { if (io) io.unobserve(tgt); targets.delete(tgt); } });
  }

  /* ---------- Faixa de bloqueio (projetos confidenciais / em andamento) ----------
     O texto é repetido duas vezes para o marquee (translateX -50%) fechar o loop sem emenda. */
  function tape(text, cls = '') {
    const run = Array(10).fill(`<span>${esc(text)}</span><i>✕</i>`).join('');
    return `<div class="tape ${cls}" aria-hidden="true"><div class="tape__track">${run}${run}</div></div>`;
  }

  window.PF = { scanReveal, initSlots, img, missing, esc, reduce, isDark, tape,
    get signal() { return pageCtl.signal; },
    data: fetch('data/portfolio-data.json', { cache: 'no-cache' }).then(r => r.json()).catch(() => ({})) };

  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    initSlots();
    scanReveal();
    PF.data.then(d => renderFooter(d.contato || {}));
  });
})();
