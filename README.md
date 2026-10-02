# Personal website

Edit content in `partials/` and styles in `assets/css/style.css`.
After changing a partial, run:

```sh
python3 scripts/build.py
```

Commit the updated partial and generated `index.html` together. The generated
HTML includes every page so content and navigation remain available without
JavaScript. JavaScript progressively enhances navigation, filters, and the theme
switch; it does not fetch page content.

Preview locally with `python3 -m http.server 8000`, then open
`http://localhost:8000`.
