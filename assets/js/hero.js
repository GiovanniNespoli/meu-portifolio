// Cena do hero (≥1100px, sem reduced-motion): animação guiada pelo scroll. ?hero=0..1 congela a cena.
(function () {
  const scene = document.querySelector('.hero-scene');
  if (!scene || getComputedStyle(scene).display === 'none') return;
  const q = id => document.getElementById(id);
  const sticky = scene.querySelector('.scene__sticky'), inn = q('s-inner'), plane = q('s-plane');
  const gIn = q('s-title-svg'), ph = q('s-photo'), phIn = q('s-photo-in'), phImg = q('s-photo-img');
  const n = q('s-sig'), nIn = q('s-sig-svg'), col = q('s-col'), c1 = q('s-c1'), c2 = q('s-c2'), c3 = q('s-c3'), c4 = q('s-c4'), c5 = q('s-c5');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fq = new URLSearchParams(location.search).get('hero');
  const frozen = fq !== null && !isNaN(+fq) ? Math.max(0, Math.min(1, +fq)) : null;
  let mx = 0, my = 0, raf = 0;
  const cl = v => Math.max(0, Math.min(1, v));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function update() {
    raf = 0;
    if (getComputedStyle(scene).display === 'none') return;
    let p = frozen;
    if (p === null) { const r = scene.getBoundingClientRect(); p = cl((75 - r.top) / Math.max(1, scene.offsetHeight - sticky.offsetHeight)); }
    const seg = (a, b) => ease(cl((p - a) / (b - a)));
    const W = inn.clientWidth, H = inn.clientHeight;
    const x = frozen === null ? mx : 0, y = frozen === null ? my : 0;
    const e = seg(0, .55);
    const s = 1 - .34 * e, dx = (W - ph.offsetWidth * s / 2 - W / 2) * e;
    ph.style.transform = `translateX(calc(-50% + ${(dx + x * 4).toFixed(1)}px)) translateY(${(y * 3).toFixed(1)}px) scale(${s.toFixed(4)})`;
    n.style.transform = `translateX(calc(-50% + ${(dx * .96 + x * 11).toFixed(1)}px)) translateY(${(-H * .05 * e + y * 5).toFixed(1)}px) scale(${(1 - .3 * e).toFixed(4)})`;
    const e1 = seg(.42, .95), k = .7;
    const dx0 = (W - c1.offsetWidth * k) - col.offsetLeft, dy0 = H * .3;
    c1.style.transform = `translate3d(${(dx0 * (1 - e1)).toFixed(1)}px,${(dy0 * (1 - e1)).toFixed(1)}px,0) scale(${(k + (1 - k) * e1).toFixed(4)})`;
    // grade 2×2 entra em diagonal: c2, depois c3 e c4 juntos, por último c5
    [[c2, seg(.6, .9)], [c3, seg(.66, .96)], [c4, seg(.66, .96)], [c5, seg(.72, 1)]].forEach(([el, t]) => {
      el.style.opacity = t.toFixed(3);
      el.style.transform = `translateY(${(40 * (1 - t)).toFixed(1)}px)`;
      el.style.pointerEvents = t > .5 ? 'auto' : 'none';
      el.style.visibility = t > .02 ? 'visible' : 'hidden';
    });
    plane.style.height = (seg(.75, 1) * 6).toFixed(2) + '%';
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  const signal = PF.signal;   // navegação suave (site.js): os listeners saem junto com a página
  addEventListener('scroll', req, { passive: true, signal });
  addEventListener('resize', req, { signal });
  if (fine && frozen === null) addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; req(); }, { passive: true, signal });
  update();

  if (frozen === null) {
    const E = 'cubic-bezier(.22,.61,.36,1)', M = 'cubic-bezier(.76,0,.24,1)';
    gIn.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(30px)' }, { clipPath: 'inset(0 0 0% 0)', transform: 'none' }], { duration: 900, easing: M, fill: 'backwards' });
    phIn.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1000, delay: 280, easing: M, fill: 'backwards' });
    phImg.animate([{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 1400, delay: 280, easing: E, fill: 'backwards' });
    nIn.animate([{ opacity: 0, transform: 'translateX(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 780, easing: E, fill: 'backwards' });
  }
})();
