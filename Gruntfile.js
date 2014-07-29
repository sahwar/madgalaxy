// Gruntfile.js
module.exports = function(grunt) {
    grunt.initConfig({
        env: {
            options: {
                //Shared Options Hash
            },
            dev: {
                NODE_ENV: 'development',
                DEST: 'temp',
                DEBUG: 'server,feedreader:*,api_v1,router:*'
            }
        },
        shell: {
            mongodb: {
                command: 'mongod --dbpath ./data',
                options: {
                    async: true,
                    stdout: false,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.'
                    }
                }
            }
        },
        // configure nodemon
        nodemon: {
            dev: {
                script: './bin/www'
            }
        }
    });
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['env', 'shell', 'nodemon']);
};