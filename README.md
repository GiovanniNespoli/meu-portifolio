# Portfólio — Giovanni Nespoli

HTML + CSS + JS puro, sem build. Rode com um servidor local (o `fetch` do JSON não funciona via `file://`):

    python3 -m http.server 5500   # http://localhost:5500

## Fotos (adicione quando tiver)
Enquanto o arquivo não existir, aparece um placeholder tracejado com o caminho esperado.
- `assets/img/retrato.jpg` — retrato (proporção 4:5, rosto no terço superior)
- `assets/img/projetos/capa-<slug>.webp` — capas 3:2 (ou o arquivo em `projetos[].capa`)
- `assets/img/projetos/<slug>-a.webp`, `<slug>-b.webp` — telas do estudo de caso (ou a lista em `projetos[].imagens`)
- As imagens de projeto já vão no HTML (`PF.img`) e entram por animação CSS ligada à rolagem (`animation-timeline: view()`, no fim de `pages.css`); sem suporte do navegador ou com movimento reduzido, aparecem direto, sem esconder nada.
- `assets/img/logos/` — `logo-a.png`, `logo-b.png` (nav/rodapé) e `<empresa>-roxo.png` (ex.: `ph-negocios-roxo.png`, `senai-roxo.png`). Sem o arquivo, é exibido o nome/wordmark.

## Conteúdo
Edite `data/portfolio-data.json` (contatos, empresas, projetos). Campos de contato vazios aparecem como "a definir".

Campos opcionais de `projetos[]`:
- `status`: `"confidencial"` (sem imagem no estudo de caso, o herói some; na galeria, painel com faixas; nenhuma imagem é carregada) ou `"em-andamento"` (imagem com faixa "Em construção" e filtro próprio)
- `destaque_galeria`: `true` coloca o projeto no formato grande; os demais vão para a grade "Mais projetos" (sem nenhum marcado, os 3 primeiros são destaque)
- `periodo`, `funcionalidades[]`, `capa`, `imagens[]` (`{ "arquivo": "x.webp", "legenda": "..." }`)
- `capa_posicao`: onde ancorar o recorte da capa no herói do estudo de caso (16:8), como em `object-position`; padrão `"50% 50%"` (centro), use `"50% 0%"` para prints de interface que perdem o topo
- `sigilo`: `{ "funcionalidades": 9 }` mostra 9 linhas de enchimento desfocadas, sob faixas "Confidencial", no lugar da lista (vale também para `decisoes`). Use no lugar de `funcionalidades[]`, não junto: o blur só esconde na tela, e o texto real no JSON e no HTML continuaria legível num repositório público
- `sem_midia`: `true` omite a seção "Imagens e links" do estudo de caso

Não coloque prints de projetos confidenciais em `assets/`: o site é estático e qualquer arquivo publicado pode ser baixado.
