// MODO ESCURO desativado por enquanto. Para reativar: descomente as linhas abaixo,
// o bloco [data-theme="dark"] em tokens.css/home.css e os botões em site.js.
// try { var t = localStorage.getItem('pf-theme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}

// Cortina entre páginas: cobre o primeiro frame da página nova até site.js inserir a cortina real
try { if (sessionStorage.getItem('pf-curtain') === '1' && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('pf-curtain'); } catch (e) {}
