'use strict';

module.exports = function apidoc(grunt) {
  // Load task
  grunt.loadNpmTasks('grunt-apidoc');

  // Options
  return {
    myapp: {
      src: "controllers/",
      dest: "apidoc/"
    }
  };
};
