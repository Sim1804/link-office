const potrace = require('potrace');
const fs = require('fs');

potrace.trace('public/logo-iris.png', {
  color: 'currentColor',
  background: 'transparent',
  optTolerance: 0.2,
  turdSize: 2,
  turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY
}, function(err, svg) {
  if (err) throw err;
  fs.writeFileSync('public/logo-iris.svg', svg);
  console.log('SVG written to public/logo-iris.svg');
});
