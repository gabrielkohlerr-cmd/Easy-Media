# Totali Garage — site institucional

Site estático (HTML/CSS/JS puro, sem build) para a Totali Garage, loja de
carros de luxo em Recife.

## Rodar localmente

```bash
cd totali-garage
python3 -m http.server 8080
# abra http://localhost:8080
```

Ou sirva a pasta com qualquer servidor estático (Vercel, Netlify, GitHub
Pages, Render Static Site etc.) — não há passo de build.

## Estrutura

- `index.html` — home: hero, filtros de estoque, grid de carros, sobre, CTA.
- `carro.html` — página de detalhes de um veículo (`carro.html?id=<id>`).
- `js/cars.js` — dados do acervo (edite aqui para adicionar/remover/alterar carros).
- `js/photo-art.js` — gera as "vitrines" em SVG usadas como placeholder de foto.
- `js/main.js` / `js/detail.js` — lógica de filtro, grid e página de detalhes.
- `js/whatsapp.js` — monta os links do WhatsApp com mensagem pronta (número
  configurado em `WHATSAPP_NUMBER`).

## Fotos reais dos carros

Cada carro hoje usa uma vitrine gerada em SVG (silhueta dourada) no lugar de
fotos reais. Para usar fotos de verdade:

1. Coloque as fotos em `assets/carros/<id-do-carro>/1.jpg`, `2.jpg` etc.
2. Em `js/cars.js`, adicione um campo `fotos: ["assets/carros/.../1.jpg", ...]`
   a cada carro.
3. Troque as chamadas a `carGallery(car)` (em `main.js` e `detail.js`) para
   montar `<img>` a partir de `car.fotos` quando o campo existir, caindo de
   volta para a vitrine em SVG quando não houver fotos.
