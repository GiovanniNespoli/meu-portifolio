// Galeria de projetos com filtro (Todos / Profissionais / Pessoais)
(function () {
  const { esc, scanReveal, initSlots, setupCrop } = PF;
  const gal = document.getElementById('gal'), fl = document.getElementById('filters');
  let all = [], filtro = 'todos';

  function draw() {
    const n = t => all.filter(p => p.tipo === t).length;
    fl.innerHTML = [['todos', 'Todos', all.length], ['Profissional', 'Profissionais', n('Profissional')], ['Pessoal', 'Pessoais', n('Pessoal')]]
      .map(([id, label, c]) => `<button type="button" data-f="${id}" aria-pressed="${filtro === id}">${label}<small>${c}</small></button>`).join('');
    const lista = all.filter(p => filtro === 'todos' || p.tipo === filtro);
    const total = String(lista.length).padStart(2, '0');
    gal.innerHTML = lista.map((p, i) => {
      const pro = p.tipo === 'Profissional', href = 'projeto.html?caso=' + encodeURIComponent(p.slug), rev = i % 2;
      return `<article class="gal__item ${rev ? 'rev' : ''}">
        <div class="gal__top"><span>${String(i + 1).padStart(2, '0')} / ${total}</span><span class="tag ${pro ? 'tag--pro' : ''}">${pro ? 'Trabalho profissional' : 'Projeto pessoal'}</span></div>
        <div class="gal__row">
          <a class="gal__media" href="${href}" tabindex="-1" aria-hidden="true"><div data-crop="7"><div class="gal__box" data-reveal="mask" data-from="${rev ? 'right' : 'left'}"><div class="zoom">
            <div class="img-slot" data-src="assets/img/projetos/capa-${esc(p.slug)}.jpg" data-label="Capa — ${esc(p.titulo)} (screenshot real)"></div></div></div></div></a>
          <div class="gal__body">
            <h2 data-reveal="up">${esc(p.titulo)}</h2>
            <p class="gal__cli" data-reveal="up">${esc(p.cliente)}</p>
            ${p.destaque ? `<p class="gal__hl" data-reveal="up">${esc(p.destaque)}</p>` : ''}
            <p class="gal__res" data-reveal="up">${esc(p.resumo)}</p>
            <p class="gal__stack" data-reveal="up">${(p.stack || []).length ? p.stack.map(esc).join('  ·  ') : 'Tecnologias a confirmar'}</p>
            <a class="proj__more" href="${href}">Abrir estudo de caso <span aria-hidden="true">→</span></a>
          </div></div></article>`;
    }).join('');
    initSlots(); scanReveal(); setupCropOnce();
  }
  let cropped = false;
  const setupCropOnce = () => { if (!cropped) { cropped = true; setupCrop(); } };
  fl.addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (b) { filtro = b.dataset.f; draw(); } });
  PF.data.then(d => { all = d.projetos || []; draw(); });
})();
