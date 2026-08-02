# JustNatur Shopify Theme

Premium Online Store 2.0 theme for **JustNatur** — India's inside-out hair wellness brand.

Design language inspired by storytelling-led wellness brands (e.g. Himalibuti): large typography, educational sections before commerce, chapter-style product narratives, and a calm premium feel.

## Brand system

| Token | Value |
|-------|-------|
| Primary | `#B53325` |
| Secondary | `#F4E2CE` |
| Accent | `#D9B38C` |
| Text | `#1A1A1A` |
| Background | `#FFFFFF` / `#FAF8F5` |
| Font | Poppins |

**Core message:** Fix the Root. Stop the Fall.

**Flagship offer:** Kesha Combo (Kesha Mula + Kesha Amrith Hair Oil)

## Install

1. Zip the `justnatur-theme` folder (contents at root of zip: `assets`, `config`, `layout`, etc.).
2. Shopify Admin → **Online Store → Themes → Add theme → Upload zip**.
3. Publish or preview.
4. Create products:
   - **Kesha Combo** (tag `combo` for flagship badge)
   - **Kesha Mula**
   - **Kesha Amrith Hair Oil**
5. Create pages and assign templates:
   - About → `page.about`
   - Science → `page.science`
   - Ingredients → `page.ingredients`
   - FAQ → `page.faq`
   - Contact → `page.contact`
   - Combo → `page.combo`
   - Reviews → `page.reviews`
6. Theme settings → assign featured products + menus (`main-menu`, `footer`).

## Templates included

- Home (storytelling: hero, problem, root cause, inside-out, ingredients, science, founder, timeline, reviews, FAQ)
- Product (gallery, sticky ATC, story chapters, how-to, timeline, FAQ)
- Collection, cart, search, 404, blog, article
- About, Science, Ingredients, FAQ, Contact, Combo landing, Reviews
- Customer account templates + gift card + password

## Structure

```
justnatur-theme/
  assets/       base.css, theme.js
  config/       settings_schema.json, settings_data.json
  layout/       theme.liquid, password.liquid
  locales/      en.default.json
  sections/     all OS 2.0 sections + header/footer groups
  snippets/     product-card, icon, meta-tags
  templates/    JSON templates + customers/
```

## Notes

- Avoids medical / miracle claims — copy uses *supports*, *helps reduce*, *promotes*.
- Cart drawer with free-shipping progress (configurable threshold).
- Mega menu highlights Kesha Combo as primary CTA.
- Add real photography in the theme editor for hero, founder, and ingredients.
