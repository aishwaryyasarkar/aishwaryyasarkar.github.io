"""Embed partials into index.html: run python3 scripts/build.py after editing partials."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def render():
    index = (ROOT / 'index.html').read_text()
    content = []
    for name in ('about', 'resume', 'publications', 'journey'):
        article = (ROOT / 'partials' / f'{name}.html').read_text()
        article = article.replace('<article ', f'<article id="{name}" ', 1)
        content.append(article)
    blocks = {
        'sidebar': (ROOT / 'partials/sidebar.html').read_text(),
        'navbar': (ROOT / 'partials/navbar.html').read_text(),
        'content': '\n'.join(content),
    }
    for name, html in blocks.items():
        pattern = rf'(<!-- BEGIN STATIC {name} -->)\n.*?(<!-- END STATIC {name} -->)'
        index, count = re.subn(pattern, lambda m: m[1] + '\n' + html.rstrip() + '\n' + m[2], index, flags=re.S)
        assert count == 1, f'Missing or duplicate {name} markers'
    return '\n'.join(line.rstrip() for line in index.splitlines()) + '\n'

if __name__ == '__main__':
    (ROOT / 'index.html').write_text(render())
