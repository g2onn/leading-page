# G2ON — Landing Page

Landing page institucional da **G2ON**, software house de desenvolvimento de soluções digitais "do conceito ao deploy".

Site em produção: [www.g2on.com.br](https://www.g2on.com.br)

## Sobre

Página estática de uma única rota, em português (pt-BR), com animações e efeitos visuais:

- Preloader, cursor customizado e barra de progresso de scroll
- Fundo de partículas em WebGL (Three.js)
- Animações de entrada e scroll (GSAP + ScrollTrigger)
- Botões magnéticos, cards com tilt e contadores animados
- Seção *showcase* com pin/scroll horizontal
- Meta tags de SEO, Open Graph e Twitter Card

## Estrutura

| Arquivo | Descrição |
|---|---|
| `index.html` | Marcação da página (hero, sobre, features, serviços, showcase, processo, contato, footer) |
| `style.css` | Estilos completos, incluindo responsividade |
| `script.js` | Animações e interações (GSAP, Three.js, efeitos de UI) |
| `favicon.svg` / `og-image.png` | Ícone e imagem de compartilhamento |
| `tech_woman_portrait.jpg` | Imagem usada na seção de features |
| `.claude/launch.json` | Config de servidor local para desenvolvimento |

## Dependências (via CDN)

- [Three.js](https://threejs.org/) r134
- [GSAP](https://gsap.com/) 3.12.5 + ScrollTrigger
- Google Fonts: Space Grotesk, Inter

Nenhum build ou gerenciador de pacotes — é HTML/CSS/JS puro.

## Rodando localmente

Qualquer servidor estático serve. Exemplo com Python:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Deploy

Basta publicar os arquivos estáticos em qualquer host (Netlify, Vercel, GitHub Pages, S3, etc.). Não há etapa de build.

## Contato

- Instagram: [@g2on_](https://instagram.com/g2on_)
- Site: [www.g2on.com.br](https://www.g2on.com.br)

© 2026 G2ON. Todos os direitos reservados.
