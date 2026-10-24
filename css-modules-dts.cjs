// Template do typescript-plugin-css-modules: declara cada `styles.classe` na mesma linha em que a
// classe está no CSS, para o "ir para definição" do editor abrir o .module.css no lugar certo.
const { readFileSync } = require('node:fs');

module.exports = (_dts, { classes, fileName }) => {
  const css = readFileSync(fileName, 'utf8').split('\n');
  const lines = css.map(() => '');
  for (const name of Object.keys(classes)) {
    const declaration = new RegExp(`(\\.|@keyframes\\s+)${name}(?![\\w-])`);
    lines[Math.max(css.findIndex((line) => declaration.test(line)), 0)] += `'${name}': string;`;
  }
  return `declare const _classes: { ${lines.join('\n')}\n};\nexport default _classes;\n`;
};
