// Estudo de caso: ?caso=<slug> (se ausente ou inválido, usa o primeiro projeto)
(function () {
  const { esc, scanReveal, img, tape } = PF;
  PF.data.then(d => {
    const all = d.projetos || [];
    if (!all.length) return;
    const slug = new URLSearchParams(location.search).get('caso');
    const p = all.find(x => x.slug === slug) || all[0];
    const nx = all[(all.indexOf(p) + 1) % all.length];
    document.title = p.titulo + ' — Giovanni Nespoli';
    const pro = p.tipo === 'Profissional', tipo = pro ? 'Trabalho profissional' : 'Projeto pessoal';
    const conf = p.status === 'confidencial', andamento = p.status === 'em-andamento';
    const status = conf ? 'Confidencial' : andamento ? 'Em andamento' : '';
    const stack = (p.stack || []).length ? p.stack : null;
    const romano = ['i.', 'ii.', 'iii.', 'iv.', 'v.', 'vi.', 'vii.', 'viii.', 'ix.', 'x.'];
    const lista = arr => (arr || []).map((t, k) => [romano[k] || (k + 1) + '.', t]);
    // Lista sob sigilo (p.sigilo = { funcionalidades: N }): a página recebe só linhas de enchimento com forma de texto,
    // o texto real não fica no JSON. Gerador fixo (mesma semente) para o desenho não mudar a cada visita.
    const sigilo = p.sigilo || {};
    const enchimento = n => {
      let s = 7;
      const r = m => (s = s * 16807 % 2147483647) % m;
      const palavra = () => Array.from({ length: 2 + r(9) }, () => 'aeioumnrstlcdp'[r(14)]).join('');
      return Array.from({ length: n }, () => Array.from({ length: 6 + r(8) }, palavra).join(' '));
    };
    const itensDe = id => sigilo[id] ? enchimento(sigilo[id]) : p[id];
    const blocos = [
      ['contexto', 'Contexto e problema', p.contexto],
      ['papel', 'Meu papel', p.papel],
      ['solucao', 'Solução desenvolvida', p.solucao],
      ['funcionalidades', 'Funcionalidades', null, lista(itensDe('funcionalidades'))],
      ['decisoes', 'Decisões relevantes', null, lista(itensDe('decisoes'))],
      ['tecnologias', 'Tecnologias', stack ? stack.join('  ·  ') : 'A confirmar.'],
      ['resultado', pro ? 'Resultado' : 'Resultado ou aprendizado', p.resultado]
    ].filter(([, , texto, itens]) => texto || (itens && itens.length));
    const ol = (itens, oculto) => `<ol${oculto ? ' aria-hidden="true"' : ''}>${itens.map(([n, t]) => `<li data-reveal="up"><span>${n}</span><span>${esc(t)}</span></li>`).join('')}</ol>`;
    const links = (p.links || []).filter(l => l && l.url);
    const caminho = f => 'assets/img/projetos/' + f;
    // imagens[] ({ arquivo, legenda }); sem a lista, mostra os dois espaços padrão <slug>-a / <slug>-b
    const imagens = (p.imagens || []).length ? p.imagens
      : [{ arquivo: `${p.slug}-a.webp`, legenda: 'Tela do projeto' }, { arquivo: `${p.slug}-b.webp`, legenda: 'Detalhe da interface' }];
    // Confidencial: sem herói e sem nenhum caminho de imagem na página.
    // Público: o <img> já vem no markup (PF.img) e a entrada na tela é CSS ligado à rolagem (pages.css)
    const hero = conf ? '' : `<div class="sec case-hero"><div class="case-hero__box"${p.capa_posicao ? ` style="--pos:${esc(p.capa_posicao)}"` : ''}>${
      img(caminho(p.capa || `capa-${p.slug}.webp`), { label: `Imagem principal — ${p.titulo}` })
      + (andamento ? tape('Em construção', 'tape--low') : '')}</div></div>`;
    const nMedia = String(blocos.length + 1).padStart(2, '0');
    // Seção "Imagens e links" (projetos[].sem_midia: true a omite)
    const midia = p.sem_midia ? '' : `
        <section class="blk blk--media" aria-labelledby="imagens-t">
          <div class="blk__h"><span>${nMedia}</span><h2 id="imagens-t">Imagens e links</h2></div>
          ${conf
            ? `<p class="case-lock" data-reveal="up">Imagens indisponíveis: projeto sob confidencialidade. Posso apresentar os detalhes numa conversa.</p>`
            : `<div class="media-grid">${imagens.map((m, k) => `
                <figure>
                  <div class="media-grid__box">${img(caminho(m.arquivo), { alt: m.legenda || '', label: m.legenda || 'Imagem do projeto' })}</div>
                  ${m.legenda ? `<figcaption>${esc(m.legenda)}</figcaption>` : ''}
                </figure>`).join('')}</div>`}
          <div class="case-links">${links.length
            ? links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)} ↗</a>`).join('')
            : conf ? '' : '<span class="ph-chip">Links a adicionar em projetos[].links (label, url)</span>'}</div>
        </section>`;

    document.getElementById('caso').innerHTML = `
      ${andamento ? tape('Em andamento', 'tape--flat') : ''}
      <header class="sec case-head" data-screen-label="Caso — Abertura">
        <div class="case-head__bar"><a class="back" href="projetos.html">← Projetos</a><span class="lbl">Estudo de caso · ${tipo}${status ? ' · ' + status : ''}</span></div>
        <h1 class="h-xl"><span class="line-mask"><span data-reveal="line">${esc(p.titulo)}</span></span></h1>
        <div class="case-head__row"><p class="case-head__cli" data-reveal="up">${esc(p.cliente)}</p>${p.destaque ? `<p class="case-head__hl" data-reveal="up">${esc(p.destaque)}</p>` : ''}</div>
        <dl class="facts">
          <div data-reveal="up"><dt class="lbl">Tipo</dt><dd>${tipo}${status ? ` <span class="tag tag--tape">${status}</span>` : ''}</dd></div>
          ${p.periodo ? `<div data-reveal="up" data-delay="40"><dt class="lbl">Período</dt><dd>${esc(p.periodo)}</dd></div>` : ''}
          <div data-reveal="up" data-delay="80"><dt class="lbl">Contribuição</dt><dd>${esc(p.contribuicao)}</dd></div>
          <div data-reveal="up" data-delay="120"><dt class="lbl">Tecnologias</dt><dd>${stack ? stack.map(esc).join(', ') : 'A confirmar'}</dd></div>
        </dl>
      </header>
      ${hero}
      <div class="sec case-body" data-screen-label="Caso — Conteúdo">
        ${blocos.map(([id, titulo, texto, itens], k) => `
          <section class="blk" aria-labelledby="b-${id}">
            <div class="blk__h"><span>${String(k + 1).padStart(2, '0')}</span><h2 id="b-${id}" data-reveal="up">${titulo}</h2></div>
            <div class="blk__b${sigilo[id] ? ' sigilo' : ''}">${texto ? `<p data-reveal="up">${esc(texto)}</p>`
              : sigilo[id] ? `<p class="sr-only">Conteúdo omitido: projeto sob confidencialidade.</p>${ol(itens, true)}${tape('Confidencial', 'tape--a')}${tape('Confidencial', 'tape--b')}`
              : ol(itens)}</div>
          </section>`).join('')}
        ${midia}
      </div>`;
    document.getElementById('next').innerHTML = `
      <a class="next" href="projeto.html?caso=${encodeURIComponent(nx.slug)}">
        <span class="eyebrow">Próximo projeto</span>
        <span class="next__row"><span class="next__t">${esc(nx.titulo)}</span><span class="next__arr" aria-hidden="true">→</span></span>
      </a>`;
    scanReveal();   // só os textos: as imagens não passam mais por reveal
  });
})();
