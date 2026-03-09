# Localized posts

Add a new post in these steps:

1. Create the source file in `posts/en/<slug>.md`
2. Copy the same filename into each locale folder:
   - `posts/nl/<slug>.md`
   - `posts/de/<slug>.md`
   - `posts/es/<slug>.md`
   - `posts/fr/<slug>.md`
   - `posts/ru/<slug>.md`
   - `posts/zh/<slug>.md`
   - `posts/ko/<slug>.md`
   - `posts/ja/<slug>.md`
   - `posts/ar/<slug>.md`
3. Keep the same slug/filename across all languages.
4. Keep frontmatter keys the same: `title`, `date`, `excerpt`, `category`, `tags`, `image`.
5. Translate the markdown body for each locale.
6. If a localized file is missing, the runtime falls back to English automatically.

Published routes:
- `/{locale}/posts/{slug}`
- Legacy `/{locale}/blog/{slug}` remains available as an alias.
