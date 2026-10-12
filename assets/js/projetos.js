// Galeria de projetos com filtro (Todos / Profissionais / Pessoais / Em andamento)
// Destaques (destaque_galeria: true; sem nenhum marcado, os 3 primeiros) no formato grande; o resto numa grade compacta.
(function () {
  const { esc, scanReveal, img, tape } = PF;
  const gal = document.getElementById('gal'), fl = document.getElementById('filters');
  let all = [], filtro = 'todos';

  const STATUS = { 'confidencial': ['Confidencial', 'Confidencial'], 'em-andamento': ['Em andamento', 'Em construção'] };
  const href = p => 'projeto.html?caso=' + encodeURIComponent(p.slug);
  const capa = p => 'assets/img/projetos/' + (p.capa || `capa-${p.slug}.webp`);
  // curto = rótulos menores para os cards da grade
  const tags = (p, curto) => {
    const pro = p.tipo === 'Profissional', st = STATUS[p.status];
    const tipo = curto ? (pro ? 'Profissional' : 'Pessoal') : (pro ? 'Trabalho profissional' : 'Projeto pessoal');
    return `<span class="tag ${pro ? 'tag--pro' : ''}">${tipo}</span>`
      + (st ? `<span class="tag tag--tape">${st[0]}</span>` : '');
  };
  // Confidencial: nenhum caminho de imagem chega à página, só o painel com as faixas.
  // Público: o <img> já vem no markup (PF.img); a entrada na tela é CSS ligado à rolagem (pages.css), sem esconder nada em JS
  const media = p => p.status === 'confidencial'
    ? `<div class="lock">${tape(STATUS.confidencial[1], 'tape--a')}${tape(STATUS.confidencial[1], 'tape--b')}</div>`
    : img(capa(p), { label: `Capa — ${p.titulo}` })
      + (p.status === 'em-andamento' ? tape(STATUS['em-andamento'][1], 'tape--low') : '');
  const num = (i, total) => `${String(i + 1).padStart(2, '0')} / ${total}`;
  const stack = p => (p.stack || []).length ? p.stack.map(esc).join('  ·  ') : 'Tecnologias a confirmar';

  const big = (p, i, total) => {
    const rev = i % 2;
    return `<article class="gal__item ${rev ? 'rev' : ''}">
      <div class="gal__top"><span>${num(i, total)}${p.periodo ? ' · ' + esc(p.periodo) : ''}</span><span class="gal__tags">${tags(p)}</span></div>
      <div class="gal__row">
        <a class="gal__media" href="${href(p)}" tabindex="-1" aria-hidden="true"><div class="gal__box"><div class="zoom">${media(p)}</div></div></a>
        <div class="gal__body">
          <h2 data-reveal="up">${esc(p.titulo)}</h2>
          <p class="gal__cli" data-reveal="up">${esc(p.cliente)}</p>
          ${p.destaque ? `<p class="gal__hl" data-reveal="up">${esc(p.destaque)}</p>` : ''}
          <p class="gal__res" data-reveal="up">${esc(p.resumo)}</p>
          <p class="gal__stack" data-reveal="up">${stack(p)}</p>
          <a class="proj__more" href="${href(p)}">Abrir estudo de caso <span aria-hidden="true">→</span></a>
        </div></div></article>`;
  };
  const card = (p, i, total) => `<a class="pj-card" href="${href(p)}">
      <div class="pj-card__box"><div class="zoom">${media(p)}</div></div>
      <span class="pj-card__top"><span>${num(i, total)}${p.periodo ? ' · ' + esc(p.periodo) : ''}</span><span class="gal__tags">${tags(p, true)}</span></span>
      <span class="pj-card__t">${esc(p.titulo)}</span>
      <span class="pj-card__cli">${esc(p.cliente)}</span>
      <span class="pj-card__res">${esc(p.resumo)}</span>
      <span class="gal__stack">${stack(p)}</span>
      <span class="proj__more">Abrir estudo de caso <span aria-hidden="true">→</span></span>
    </a>`;

  function draw() {
    const n = f => all.filter(f).length;
    const filtros = [
      ['todos', 'Todos', () => true],
      ['Profissional', 'Profissionais', p => p.tipo === 'Profissional'],
      ['Pessoal', 'Pessoais', p => p.tipo === 'Pessoal'],
      ['em-andamento', 'Em andamento', p => p.status === 'em-andamento']
    ].filter(([id, , f]) => id !== 'em-andamento' || n(f));
    const ativo = filtros.find(([id]) => id === filtro) || filtros[0];
    fl.innerHTML = filtros.map(([id, label, f]) => `<button type="button" data-f="${id}" aria-pressed="${ativo[0] === id}">${label}<small>${n(f)}</small></button>`).join('');

    const lista = all.filter(ativo[2]);
    const marcados = lista.some(p => p.destaque_galeria);
    const dest = lista.filter((p, i) => marcados ? p.destaque_galeria : i < 3), resto = lista.filter(p => !dest.includes(p));
    const total = String(lista.length).padStart(2, '0');
    gal.innerHTML = dest.map((p, i) => big(p, i, total)).join('')
      + (resto.length ? `<section class="pj-more" aria-labelledby="pj-more-t">
          <div class="pj-more__head"><h2 id="pj-more-t" data-reveal="up">Mais projetos</h2><span class="lbl" data-reveal="up">${String(resto.length).padStart(2, '0')} projetos</span></div>
          <div class="pj-grid">${resto.map((p, k) => card(p, dest.length + k, total)).join('')}</div></section>` : '');
    scanReveal();   // só os textos: as imagens não passam mais por reveal
  }
  fl.addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (b) { filtro = b.dataset.f; draw(); } });
  PF.data.then(d => { all = d.projetos || []; draw(); });
})();
