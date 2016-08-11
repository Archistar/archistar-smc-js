module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      dist: {
        files: {
          'build/main.js': ['src/**/*.js'],
          'build/suite1.js': ['scripts/suite1.js']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        'esversion': 6,
      }
    },
    nodeunit: {
      all: ['test/**/*.js']
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  //in case we ever need to regenerate the lookup tables:
  //uncomment the following two lines and do "grunt generate:lookup:table"
  //grunt.config.set('logtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[0].toString());
  //grunt.config.set('alogtable', eval(grunt.file.read('scripts/generate_lookup_tables.js'))[1].toString());

  grunt.registerTask('default', ['jshint', 'browserify']);
  grunt.registerTask('test', ['jshint', 'browserify', 'nodeunit']);
};
