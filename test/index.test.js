const test = require('test');
const path = require('path');
const read = require('@fibjs/fs-readdir-recursive');

let files = read(path.join(__dirname, 'lib'));

files = files.filter(f => path.basename(f).endsWith('.test.js'));

files = files.map(f => path.join(__dirname, 'lib', f));

files.forEach(f => run(f));

process.exit(test.run(console.DEBUG));
