module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['.grunt/'],
        copy: {
            build: {
                files: [{
                    expand: true,
                    src: ['mathjax/**'],
                    dest: '.grunt/build/'
                }]
            }
        },
        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    '.grunt/build/index.html': 'index.html'
                }
            }
        },
        cssmin: {
            build: {
                options: {
                    report: 'gzip'
                },
                files: {
                    '.grunt/build/index.css': ['index.css']
                }
            }
        },
        requirejs: {
            build: {
                options: {
                    name: 'index',
                    out: '.grunt/build/index.js',
                    baseUrl: 'js',
                    almond: true,
                    replaceRequireScript: [
                        {
                            files: ['.grunt/build/index.html'],
                            module: 'index',
                            modulePath: 'index'
                        }
                    ],
                    paths: {
                        "index": "../index",
                        "vow": "../vendor/vow",
                        "jquery": "../vendor/jquery",
                        "jquery.svg": "../vendor/jquery.svg"
                    }
                }
            }
        },
        'gh-pages': {
            options: {
                base: '.grunt/build'
            },
            src: [
                'index.html',
                'index.js',
                'index.css'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-gh-pages');

    grunt.registerTask('default', function () {
        grunt.log.writeln('Please look README file');
    });
    grunt.registerTask('build', ['clean', 'copy', 'htmlmin', 'cssmin', 'requirejs', 'after-build']);

    grunt.registerTask('after-build', function () {
        grunt.log.writeln('Now you can check resulting files: open `.grunt/build/index.html` in web-browser');
    });
};
