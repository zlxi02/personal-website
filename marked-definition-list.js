// Extension for marked to support definition lists
// Syntax:
// Term
// : Definition

export function markedDefinitionList() {
  return {
    extensions: [
      {
        name: 'definitionList',
        level: 'block',
        start(src) {
          return src.match(/^[^\n]+\n: /)?.index;
        },
        tokenizer(src) {
          const match = src.match(/^([^\n]+)\n((?:: [^\n]+\n?)+)/);
          if (match) {
            const term = match[1].trim();
            const definitions = match[2]
              .split('\n')
              .filter(line => line.startsWith(': '))
              .map(line => line.slice(2).trim());
            
            return {
              type: 'definitionList',
              raw: match[0],
              term,
              definitions
            };
          }
        },
        renderer(token) {
          const definitions = token.definitions
            .map(def => `  <dd>${def}</dd>`)
            .join('\n');
          return `<dl>\n  <dt>${token.term}</dt>\n${definitions}\n</dl>\n`;
        }
      }
    ]
  };
}

