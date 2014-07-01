/*
 * Grunt for LiveReload
 * The aim of the project was to avoid Grunt, as it
 * should not be needed with Polymer. However, 
 * LiveReload doesn't work with Sublime Text 3, so, 
 * we use Grunt for LiveReload.
 */
module.exports = function(grunt) {
  'use strict';
  
  grunt.initConfig({
    watch: {
      html: {
        files: '**/*.html',
        tasks: [],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  
  // Default task
  grunt.registerTask('default', ['watch']);

};