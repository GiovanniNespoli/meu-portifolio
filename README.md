# Portfólio — Giovanni Nespoli

HTML + CSS + JS puro, sem build. Rode com um servidor local (o `fetch` do JSON não funciona via `file://`):

    python3 -m http.server 5500   # http://localhost:5500

## Fotos (adicione quando tiver)
Enquanto o arquivo não existir, aparece um placeholder tracejado com o caminho esperado.
- `assets/img/retrato.jpg` — retrato (proporção 4:5, rosto no terço superior)
- `assets/img/projetos/capa-<slug>.jpg` — capas 16:10 (`automacao-financeira`, `admtf`, `ttt`)
- `assets/img/logos/` — `logo-a.png`, `logo-b.png` (nav/rodapé) e `<empresa>-roxo.png` (ex.: `ph-negocios-roxo.png`, `senai-roxo.png`). Sem o arquivo, é exibido o nome/wordmark.

## Conteúdo
Edite `data/portfolio-data.json` (contatos, empresas, projetos). Campos de contato vazios aparecem como "a definir".
