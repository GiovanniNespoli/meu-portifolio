// Estudo de caso: ?caso=<slug> (se ausente ou inválido, usa o primeiro projeto)
(function () {
  const { esc, scanReveal, initSlots, setupCrop } = PF;
  PF.data.then(d => {
    const all = d.projetos || [];
    if (!all.length) return;
    const slug = new URLSearchParams(location.search).get('caso');
    const p = all.find(x => x.slug === slug) || all[0];
    const nx = all[(all.indexOf(p) + 1) % all.length];
    document.title = p.titulo + ' — Giovanni Nespoli';
    const pro = p.tipo === 'Profissional', tipo = pro ? 'Trabalho profissional' : 'Projeto pessoal';
    const stack = (p.stack || []).length ? p.stack : null;
    const romano = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.'];
    const blocos = [
      ['contexto', 'Contexto e problema', p.contexto],
      ['papel', 'Meu papel', p.papel],
      ['solucao', 'Solução desenvolvida', p.solucao],
      ['decisoes', 'Decisões relevantes', null, (p.decisoes || []).map((t, k) => [romano[k] || (k + 1) + '.', t])],
      ['tecnologias', 'Tecnologias', stack ? stack.join('  ·  ') : 'A confirmar.'],
      ['resultado', pro ? 'Resultado' : 'Resultado ou aprendizado', p.resultado]
    ];
    const links = (p.links || []).filter(l => l && l.url);

    document.getElementById('caso').innerHTML = `
      <header class="sec case-head" data-screen-label="Caso — Abertura">
        <div class="case-head__bar"><a class="back" href="projetos.html">← Projetos</a><span class="lbl">Estudo de caso · ${tipo}</span></div>
        <h1 class="h-xl"><span class="line-mask"><span data-reveal="line">${esc(p.titulo)}</span></span></h1>
        <div class="case-head__row"><p class="case-head__cli" data-reveal="up">${esc(p.cliente)}</p>${p.destaque ? `<p class="case-head__hl" data-reveal="up">${esc(p.destaque)}</p>` : ''}</div>
        <dl class="facts">
          <div data-reveal="up"><dt class="lbl">Tipo</dt><dd>${tipo}</dd></div>
          <div data-reveal="up" data-delay="60"><dt class="lbl">Contribuição</dt><dd>${esc(p.contribuicao)}</dd></div>
          <div data-reveal="up" data-delay="120"><dt class="lbl">Tecnologias</dt><dd>${stack ? stack.map(esc).join(', ') : 'A confirmar'}</dd></div>
        </dl>
      </header>
      <div class="sec case-hero"><div data-crop="10"><div class="case-hero__box" data-reveal="mask">
        <div class="img-slot" data-src="assets/img/projetos/capa-${esc(p.slug)}.jpg" data-label="Imagem principal — ${esc(p.titulo)} (somente imagens autorizadas)"></div></div></div></div>
      <div class="sec case-body" data-screen-label="Caso — Conteúdo">
        ${blocos.map(([id, titulo, texto, lista], k) => (texto || lista) ? `
          <section class="blk" aria-labelledby="b-${id}">
            <div class="blk__h"><span>${String(k + 1).padStart(2, '0')}</span><h2 id="b-${id}" data-reveal="up">${titulo}</h2></div>
            <div class="blk__b">${texto ? `<p data-reveal="up">${esc(texto)}</p>` : `<ol>${lista.map(([n, t]) => `<li data-reveal="up"><span>${n}</span><span>${esc(t)}</span></li>`).join('')}</ol>`}</div>
          </section>` : '').join('')}
        <section class="blk blk--media" aria-labelledby="imagens-t">
          <div class="blk__h"><span>07</span><h2 id="imagens-t">Imagens e links</h2></div>
          <div class="media-grid">
            <div data-reveal="mask" data-from="left"><div class="img-slot" data-src="assets/img/projetos/${esc(p.slug)}-a.jpg" data-label="Tela do projeto — imagem autorizada"></div></div>
            <div data-reveal="mask" data-from="right" data-delay="100"><div class="img-slot" data-src="assets/img/projetos/${esc(p.slug)}-b.jpg" data-label="Detalhe da interface — imagem autorizada"></div></div>
          </div>
          <div class="case-links">${links.length
            ? links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)} ↗</a>`).join('')
            : '<span class="ph-chip">Links a adicionar em projetos[].links (label, url)</span>'}</div>
        </section>
      </div>`;
    document.getElementById('next').innerHTML = `
      <a class="next" href="projeto.html?caso=${encodeURIComponent(nx.slug)}">
        <span class="eyebrow">Próximo projeto</span>
        <span class="next__row"><span class="next__t">${esc(nx.titulo)}</span><span class="next__arr" aria-hidden="true">→</span></span>
      </a>`;
    initSlots(); scanReveal(); setupCrop();
  });
})();
