import { visit } from 'unist-util-visit';
export default function rehypeEnlacesExternos({ sitio = 'https://morecontextai.com' } = {}) {
  return (tree) => visit(tree, 'element', (n) => {
    if (n.tagName !== 'a' || typeof n.properties?.href !== 'string') return;
    const href = n.properties.href;
    if (/^https?:\/\//.test(href) && !href.startsWith(sitio)) {
      n.properties.target = '_blank';
      n.properties.rel = ['noopener', 'noreferrer'];
      n.properties.className = [...[].concat(n.properties.className ?? []), 'ext'];
    }
  });
}
