var lessBuilder = require('less-builder');
lessBuilder.watch({
  target: 'less',
  entry: 'less/main.less',
  output: 'dst/style',
});
