var lessBuilder = require('less-css-builder');
lessBuilder.build({
  target: 'less',
  entry: 'less/main.less',
  output: 'dst/style',
});
