const path = require('path');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    benchmark: {
      krawczyk_css_encode: {
        src: ['benchmarks/krawczyk_css-encode.js']
      },
      krawczyk_css: {
        src: ['benchmarks/krawczyk_css.js']
      },
      salsa20: {
        src: ['benchmarks/salsa20.js']
      }
    },
    webpack: {
      options: {
        entry: "./src/krawczyk_css.js",
        output: {
          path: path.resolve(__dirname, "dist"),
          filename: "archistar.js",
          library: "ArchistarJS",
          libraryTarget: "var"
        },
        target: "web"
      },
      standard: {}
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', 'benchmarks/**/*.js'],
      options: {
        'esversion': 6,
      }
    },
    nodeunit: {
      all: ['test/**/*.js']
    },
  });

  grunt.loadNpmTasks('grunt-benchmark');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  //in case we ever need to regenerate the lookup tables:
  //uncomment the following two lines and do "grunt generate:lookup:table"
  //grunt.config.set('logtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[0].toString());
  //grunt.config.set('alogtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[1].toString());

  grunt.registerTask('bench', ['jshint', 'benchmark']);
  grunt.registerTask('default', ['jshint', 'webpack']);
  grunt.registerTask('test', ['jshint', 'nodeunit']);
};
