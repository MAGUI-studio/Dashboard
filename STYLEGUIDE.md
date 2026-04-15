# MAGUI.studio Style Guide

Este guia define os padrões visuais e de desenvolvimento para o ecossistema MAGUI.studio, garantindo consistência entre o projeto principal e seus subprojetos.

---

## 1. Princípios de Design
- **Minimalismo de Elite:** Interfaces limpas com foco em tipografia e espaçamento.
- **Performance em Primeiro Lugar:** Uso extensivo de Server Components e otimização de ativos.
- **Tipografia Brutalista/Moderna:** Títulos grandes, em caixa alta (uppercase) e com leading (entrelinha) reduzido.

---

## 2. Cores (OKLCH)
Utilizamos o espaço de cor OKLCH para maior precisão e acessibilidade.

| Nome | Valor Light | Valor Dark | Hex (Aprox) | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Primary** | `oklch(0.65 0.2 240)` | `oklch(0.65 0.2 240)` | `#0093C8` | CTAs, Destaques, Ícones |
| **Background** | `oklch(1 0 0)` | `oklch(0.12 0 0)` | `#FFFFFF` / `#141414` | Fundo principal |
| **Foreground** | `oklch(0.1 0 0)` | `oklch(0.98 0 0)` | `#1A1A1A` / `#FAFAFA` | Texto principal |
| **Muted Foreground**| `oklch(0.4 0 0)` | `oklch(0.7 0 0)` | `#666666` / `#B3B3B3` | Descrições e textos secundários |
| **Border** | `oklch(0 0 0 / 5%)` | `oklch(1 0 0 / 8%)` | - | Divisores sutis |

---

## 3. Tipografia

### Fontes
Definidas em `src/config/fonts.ts`:
- **Heading:** `Lexend` (300-900) - Títulos e impacto.
- **Decorative:** `Syne` (400-800) - Acentos específicos.
- **Sans:** `Montserrat` (100-900) - Corpo de texto, botões e labels.
- **Mono:** `Geist Mono` - Dados técnicos ou código.

### Escala de Textos
| Nível | Classes Tailwind | Estilo |
| :--- | :--- | :--- |
| **H1 (Hero)** | `text-5xl md:text-8xl 2xl:text-9xl` | `font-black uppercase leading-[0.75] tracking-[-0.06em]` |
| **H2 (Seção)** | `text-4xl sm:text-6xl lg:text-8xl` | `font-black uppercase leading-[0.86] tracking-[-0.05em]` |
| **H3 (Card)** | `text-3xl sm:text-5xl` | `font-black uppercase leading-[0.88] tracking-[-0.05em]` |
| **Eyebrow** | `text-[10px] sm:text-[11px]` | `font-black uppercase tracking-[0.5em] text-brand-primary` |
| **Body Large** | `text-xl md:text-2xl` | `font-medium leading-relaxed tracking-tight` |
| **Body Normal** | `text-base md:text-lg` | `leading-relaxed text-muted-foreground` |
| **Labels/Caps** | `text-[10px]` | `font-black uppercase tracking-[0.34em]` |

---

## 4. Layout e Espaçamento

### Grid e Containers
- **Max-Width Global:** `max-w-440` (110rem / 1760px).
- **Padding de Seção (Horizontal):** `px-6 md:px-12 lg:px-24`.
- **Padding de Seção (Vertical):** `py-20 lg:py-32`.
- **Gaps Padrão:** `gap-8`, `gap-12` ou `gap-16`.

### Bordas e Arredondamento
- **Containers/Menus:** `rounded-2xl` (1.5rem) ou `rounded-4xl` (para blocos maiores/imagens).
- **Interativos (Botões/Triggers):** `rounded-full`.
- **Bordas:** Preferencialmente `border-border/60` (sutis).

---

## 5. Componentes e Comportamentos

### Efeitos
- **Blur:** `backdrop-blur-sm` ou `backdrop-blur-xl` para overlays e headers.
- **Sombras:** `shadow-2xl shadow-brand-primary/20` para botões principais.
- **Animações:** Uso de Framer Motion com `VARIANTS_FADE_IN_UP` para entradas de seção.

### Ícones
- **Biblioteca:** `Phosphor Icons` (@phosphor-icons/react).
- **Estilo:** `bold` para ícones de ação, `regular` para informativos.

---

## 6. Boas Práticas (Subprojetos)
1. **Server Components:** Mantenha componentes como Server Components por padrão.
2. **i18n:** Nunca hardcode strings. Use o namespace correto em `messages/*.json`.
3. **Semantic HTML:** Use `<section>`, `<header>`, `<footer>`, `<article>` em vez de apenas `<div>`.
4. **Imagens:** Sempre use `next/image` com `sizes` e `quality` otimizados (65-75).
