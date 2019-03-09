var lessBuilder = require('less-builder');
lessBuilder.build({
  target: 'less',
  entry: 'less/main.less',
  output: 'dst/style',
});
