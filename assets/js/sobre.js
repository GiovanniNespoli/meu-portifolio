// Sobre: timeline, estudos, cursos, formação e competências a partir do JSON
(function () {
  const { esc, scanReveal } = PF;
  const $ = id => document.getElementById(id);
  PF.data.then(d => {
    const tl = $('tl'), fill = $('tl-fill');
    tl.insertAdjacentHTML('beforeend', (d.experiencias || []).map((e, i) => `
      <li class="tl__item" data-tl-item>
        <span class="tl__dot" aria-hidden="true"></span>
        <div class="tl__meta"><span>${String(i + 1).padStart(2, '0')}</span>
          ${e.atual ? '<span class="tl__now">Atual</span>' : ''}
          ${e.periodo ? `<span>${esc(e.periodo)}</span>` : '<span class="ph-chip">período a definir</span>'}</div>
        <h3>${e.empresa ? esc(e.empresa) : '<span class="tbd-t">Empresa a definir</span>'}</h3>
        <p class="tl__role">${e.cargo ? esc(e.cargo) : '<span class="ph-chip">cargo a definir</span>'}</p>
        <p class="tl__desc">${esc(e.descricao || '')}</p>
        <ul class="tl__hl">${(e.destaques || []).map(x => `<li><span aria-hidden="true">—</span><span>${esc(x)}</span></li>`).join('')}</ul>
        <p class="tl__stack">${(e.stack || []).map(esc).join('  ·  ')}</p>
      </li>`).join(''));

    $('estudos').innerHTML = (d.estudos || []).map(s => `<li data-reveal="up"><div class="row-top"><span class="row-t">${esc(s.titulo)}</span><span class="badge">Em andamento</span></div><span class="row-n">${esc(s.nota || '')}</span></li>`).join('');
    const rows = (arr, empty) => arr.length
      ? arr.map(c => `<li class="row-top"><span class="row-t">${esc(c.nome)}</span><span class="row-n">${esc(c.instituicao || '')} · ${esc(c.periodo || '')}</span></li>`).join('')
      : `<li class="empty" data-reveal="up">${empty}</li>`;
    $('cursos').innerHTML = rows(d.cursos || [], 'Nenhum curso cadastrado. Adicione nome, instituição e período em <span class="ph-chip">cursos</span>.');
    $('formacao').innerHTML = rows(d.formacao || [], 'A preencher em <span class="ph-chip">formacao</span>.');
    $('skills').innerHTML = (d.competencias || []).map((g, i) => `<div class="skill" data-reveal="up"><p class="n">${String(i + 1).padStart(2, '0')}</p><h3>${esc(g.area)}</h3><ul>${g.itens.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
    scanReveal();

    // Progresso da timeline
    const items = Array.from(tl.querySelectorAll('[data-tl-item]'));
    let raf = 0;
    const run = () => {
      raf = 0;
      const mark = innerHeight * .55, r = tl.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (mark - r.top) / (r.height - 16)));
      fill.style.height = (p * (r.height - 16)).toFixed(1) + 'px';
      let a = 0;
      items.forEach((it, i) => { if (it.getBoundingClientRect().top < mark) a = i; });
      items.forEach((it, i) => { it.classList.toggle('is-active', i === a); it.classList.toggle('is-passed', i <= a); });
      items.forEach((it, i) => i === a ? it.setAttribute('aria-current', 'step') : it.removeAttribute('aria-current'));
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(run); };
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); run();
  });
})();
