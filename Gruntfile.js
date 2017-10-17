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
      rabin_ids: {
        src: ['benchmarks/rabin_ids.js']
      },
      salsa20: {
        src: ['benchmarks/salsa20.js']
      },
      shamir_pss: {
        src: ['benchmarks/shamir_pss.js']
      }
    },
    rollup: {
      options: {},
      dist: {
        dest: 'dist/archistar.js',
        src: 'src/krawczyk_css.js',
        options: {
          format: 'umd',
          moduleName: 'archistarJS',
          external: ['randombytes']
        }
      },
      test: {
        dest: 'dist/test.js',
        src: 'src/test.js',
        options: {
          format: 'cjs'
        }
      }
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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-rollup');

  //in case we ever need to regenerate the lookup tables:
  //uncomment the following two lines and do "grunt generate:lookup:table"
  //grunt.config.set('logtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[0].toString());
  //grunt.config.set('alogtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[1].toString());

  grunt.registerTask('bench', ['jshint', 'rollup:test', 'benchmark']);
  grunt.registerTask('default', ['jshint', 'rollup:dist']);
  grunt.registerTask('test', ['jshint', 'rollup:test', 'nodeunit']);
};
