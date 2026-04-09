# /public – Imagens do Site

## Placeholder atual

O Hero está usando uma imagem de placeholder do **Unsplash** via URL direta.
Para trocar pela imagem definitiva, edite a constante `HERO_IMAGE` em:

```
src/components/site/Hero.tsx
```

Troque:
```ts
const HERO_IMAGE = 'https://images.unsplash.com/...'
```
Por:
```ts
const HERO_IMAGE = '/hero-bg.jpg'
```

E coloque o arquivo `hero-bg.jpg` nesta pasta `/public`.

## Imagens necessárias

| Arquivo | Descrição | Dimensões sugeridas |
|---------|-----------|---------------------|
| `hero-bg.jpg` | Imagem principal do Hero (fullscreen) | 1920×1080px |
| `dentists.jpg` | Foto dos dentistas (seção Sobre) | 800×1000px (retrato) |

## Suas imagens

Das imagens enviadas:
- `1000417857.jpg` → renomear para `dentists.jpg`
- `1000417859.jpg` → pode usar como `hero-bg.jpg`
