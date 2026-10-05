# Alok Plastics — Redirect Map

301 redirects from the existing website (presumably WordPress) to the new static site.

---

## Status

`TODO(client): Please provide a list of current page URLs from alokplastics.com, or a WordPress sitemap export (XML), so we can build the redirect map.`

Once the URL list is provided, all old URLs will be 301-redirected to their closest new equivalent. This is critical for preserving search engine rankings.

---

## Strategy

| Old URL pattern | New URL | Notes |
|---|---|---|
| `/` (home) | `/` | No redirect needed |
| `/products` or `/shop` | `/products` | |
| `/about`, `/about-us` | `/about` | |
| `/contact`, `/contact-us` | `/contact` | |
| Individual product pages | `/products/[group]/[part-slug]` | Requires URL mapping from client |

---

## .htaccess Implementation

Redirects will be implemented in `public/.htaccess` once the URL list is provided.

Template (to be populated):
```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# 301 redirects from old URLs
# RewriteRule ^old-page/?$ /new-page/ [R=301,L]

# TODO(client): add redirects once old URL list is provided
```

## Product group reorganisation (five groups)

The four earlier groups were replaced by five. `public/.htaccess` section 3 redirects the old group and product URLs (301):

| Old URL | New URL |
|---|---|
| `/products/sliding-door-systems/` and `/products/sealing/` | `/products/deep-freezer-display-counter-parts/` |
| `/products/water-control/` and `/products/ventilation-levelling/` | `/products/water-cooler-spare-parts/` |
| `/products/sliding-door-systems/<part>/` and `/products/sealing/<part>/` | `/products/deep-freezer-display-counter-parts/<part>/` (except `connecting-bush`, which moves to `/products/water-cooler-spare-parts/connecting-bush/`) |
| `/products/water-control/<part>/` and `/products/ventilation-levelling/<part>/` | `/products/water-cooler-spare-parts/<part>/` |

The product-to-group assignment is provisional until the client confirms it (see `docs/client-questions.md`).
