// Dibuja los ```mermaid solo en las páginas que los tienen (carga diferida de la librería).
const nodos = document.querySelectorAll<HTMLElement>('pre.mermaid');
if (nodos.length) {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: '#0f0f11',
      fontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
      fontSize: '13px',
      primaryColor: '#0a0a0a',
      primaryTextColor: '#f4f4f5',
      primaryBorderColor: '#3f3f46',
      secondaryColor: '#18181b',
      tertiaryColor: '#18181b',
      lineColor: '#71717a',
      textColor: '#d4d4d8',
      edgeLabelBackground: '#0f0f11',
      clusterBkg: '#18181b',
      clusterBorder: '#27272a',
      noteBkgColor: '#1f1f23',
      noteTextColor: '#f4f4f5',
      noteBorderColor: '#fde047',
      actorBkg: '#0a0a0a',
      actorBorder: '#3f3f46',
      actorTextColor: '#f4f4f5',
      signalColor: '#a1a1aa',
      signalTextColor: '#d4d4d8',
    },
  });
  await mermaid.run({ nodes: [...nodos] });
}
export {};
