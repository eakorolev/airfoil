module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                expand: true,
                src: ['index.html'],
                dest: 'build/'
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: 'index',
                    out: 'build/index.js',
                    almond: true,
                    replaceRequireScript: [{
                        files: ['build/index.html'],
                        module: 'index',
                        modulePath: 'index'
                    }]
                }
            }
        },
        'gh-pages': {
            options: {
                base: 'build'
            },
            src: [
                'index.html',
                'index.js',
                'index.css'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('default', function() {
        grunt.log.writeln('Run `grunt build` to build production code');
    });
    grunt.registerTask('build', function() {
        grunt.task.run('copy', 'requirejs');
        grunt.log.writeln('Now you can check build files: open `build/index.html` in browser');
    });
    grunt.registerTask('release', ['gh-pages']);

};
