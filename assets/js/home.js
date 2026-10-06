// Home: marquee de empresas a partir de data/portfolio-data.json
(function () {
  const { esc } = PF;
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  PF.data.then(d => {
    // Empresas (logo em assets/img/logos/<slug>-roxo.png; se não existir, mostra o nome)
    const emp = d.empresas || [];
    document.getElementById('emp-count').textContent = String(emp.length).padStart(2, '0') + ' organizações';
    document.getElementById('emp-sr').innerHTML = emp.map(n => `<li>${esc(n)}</li>`).join('');
    const item = n => `<div class="mq__item"><img src="assets/img/logos/${slug(n)}-roxo.png" alt="" loading="lazy" onerror="this.outerHTML='<span class=&quot;name&quot;>${esc(n)}</span>'"></div>`;
    document.getElementById('mq').innerHTML = emp.concat(emp).map(item).join('');
  });
})();

