// Callouts estilo Obsidian/GitHub:  > [!consejo] Título opcional   |  > [!aviso]- Plegado
import { visit } from 'unist-util-visit';

const TIPOS = {
  nota: 'info', note: 'info', info: 'info', abstract: 'info', resumen: 'info',
  consejo: 'consejo', tip: 'consejo', hint: 'consejo', important: 'consejo', importante: 'consejo',
  aviso: 'aviso', warning: 'aviso', caution: 'aviso', attention: 'aviso', atencion: 'aviso',
  peligro: 'peligro', danger: 'peligro', error: 'peligro', bug: 'peligro', failure: 'peligro',
  ejemplo: 'ejemplo', example: 'ejemplo', ejercicio: 'ejercicio', exercise: 'ejercicio',
  pregunta: 'pregunta', question: 'pregunta', faq: 'pregunta', cita: 'cita', quote: 'cita',
};
export const ETIQUETAS = { info: 'Nota', consejo: 'Consejo', aviso: 'Aviso', peligro: 'Peligro',
  ejemplo: 'Ejemplo', ejercicio: 'Ejercicio', pregunta: 'Pregunta', cita: 'Cita' };

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const p = node.children[0];
      const t = p?.type === 'paragraph' ? p.children[0] : null;
      if (!t || t.type !== 'text') return;
      const m = t.value.match(/^\[!([\p{L}-]+)\]([+-]?)[ \t]*([^\n]*)\n?/u);
      if (!m) return;
      const clave = m[1].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const tipo = TIPOS[clave] ?? 'info';
      const plegable = m[2] !== '';
      const titulo = m[3].trim() || ETIQUETAS[tipo];

      t.value = t.value.slice(m[0].length);
      if (!t.value) p.children.shift();
      if (!p.children.length) node.children.shift();

      node.data = { hName: plegable ? 'details' : 'aside',
        hProperties: { className: ['callout', `callout--${tipo}`], dataCallout: tipo, ...(plegable && m[2] === '+' ? { open: true } : {}) } };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: plegable ? 'summary' : 'p', hProperties: { className: ['callout__titulo'] } },
        children: [
          { type: 'text', value: ETIQUETAS[tipo], data: { hName: 'span', hProperties: { className: ['callout__tipo'] } } },
          { type: 'text', value: titulo === ETIQUETAS[tipo] ? '' : titulo },
        ],
      });
    });
  };
}
