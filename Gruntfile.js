const uglify = require('rollup-plugin-uglify');
const uglify_es = require('uglify-es');
const commonjs = require("rollup-plugin-commonjs");

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    benchmark: {
      krawczyk_encode: {
        src: ['benchmarks/krawczyk-encode.js']
      },
      krawczyk_decode: {
        src: ['benchmarks/krawczyk-decode.js']
      },
      rabin_encode: {
        src: ['benchmarks/rabin-encode.js']
      },
      rabin_decode: {
        src: ['benchmarks/rabin-decode.js']
      },
      salsa20: {
        src: ['benchmarks/salsa20.js']
      },
      shamir_encode: {
        src: ['benchmarks/shamir-encode.js']
      },
      shamir_decode: {
        src: ['benchmarks/shamir-decode.js']
      }
    },
    rollup: {
      options: {},
      noasm: {
        dest: 'dist/archistar.noasm.js',
        src: 'src/lib.noasm.js',
        options: {
          format: 'umd',
          moduleName: 'archistarJS',
          external: ['randombytes']
        }
      },
      dist: {
        dest: 'dist/archistar.js',
        src: 'src/lib.js',
        options: {
          format: 'umd',
          moduleName: 'archistarJS',
          external: ['randombytes','fs','path'],
          plugins: [
            uglify({}, uglify_es.minify),
            commonjs({include: 'dist/secret.js'})
          ]
        }
      },
      test: {
        dest: 'dist/test.js',
        src: 'src/test.js',
        options: {
          external: ['fs','path'],
          format: 'umd',
          moduleName: 'archistarJS',
          plugins: [commonjs({include: 'dist/secret.js'})]
        }
      },
      test_noasm: {
        dest: 'dist/test.js',
        src: 'src/test.noasm.js',
        options: {
          format: 'umd',
          moduleName: 'archistarJS'
        }
      }
    },
    shell: {
      emcc: 'emcc src/secret.c -o dist/secret.js -s EXPORTED_FUNCTIONS=\"[\'_RabinEncode\',\'_RabinDecode\']\" -O1 --memory-init-file 0 -s NO_DYNAMIC_EXECUTION=1 -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[] -s STRICT=1 -s MODULARIZE=1'
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
  grunt.loadNpmTasks('grunt-shell');

  //in case we ever need to regenerate the lookup tables:
  //uncomment the following two lines and do "grunt generate:lookup:table"
  //grunt.config.set('logtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[0].toString());
  //grunt.config.set('alogtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[1].toString());

  grunt.registerTask('bench', ['jshint', 'shell:emcc', 'rollup:test', 'benchmark']);
  grunt.registerTask('bench-noasm', ['jshint', 'rollup:test_noasm', 'benchmark']);
  grunt.registerTask('default', ['jshint', 'shell:emcc', 'rollup:dist']);
  grunt.registerTask('test', ['jshint', 'shell:emcc', 'rollup:test', 'nodeunit']);
  grunt.registerTask('test-noasm', ['jshint', 'rollup:test_noasm', 'nodeunit']);
  grunt.registerTask('noasm', ['jshint', 'rollup:noasm']);
};
