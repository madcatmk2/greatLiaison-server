var fs = require('fs');
var check = require('syntax-error');

var rootDir = __dirname + '/..';
/* var file = __dirname + '/../controllers/auth/index.js';
var src = fs.readFileSync(file); */

/* var err = check(src, file);
if (err) {
    console.error('ERROR DETECTED' + Array(62).join('!'));
    console.error(err);
    console.error(Array(76).join('-'));
} */




var walk = function(dir) {
//   var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) console.error(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return;
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (file.indexOf('node_modules') < 0
            && file.indexOf('apidoc') < 0
            && file.indexOf('.git') < 0
            && file.indexOf('.build') < 0
            && file.indexOf('config') < 0) {
          if (stat && stat.isDirectory()) {
            walk(file, function(err, res) {
//               results = results.concat(res);
              next();
            });
          } else {
//             results.push(file);
            var src = fs.readFileSync(file);
            var error = check(src, file);
            if (error) {
              console.error('ERROR DETECTED' + Array(62).join('!'));
              console.error(error);
              console.error(Array(76).join('-'));
            }
            next();
          }
        } else {
          next();
        }
      });

    })();
  });
};

walk(rootDir);
/* walk(rootDir, function(err, results) {
  if (err) throw err;
  console.log(results);
}); */
