// Gruntfile.js
module.exports = function(grunt) {
    grunt.initConfig({
        env: {
            options: {
                //Shared Options Hash
            },
            dev: {
                BONSAI_URL: "https://41gtgqrs:zcfwxb0h8fs9xqy7@smoke-9606326.us-east-1.bonsai.io:443/",
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
        },



        notify: {
            shell: {
                options: {
                    title: 'Task Complete',
                    message: 'Started mongo'
                }
            },
            nodemon: {
                options: {
                    title: 'Task Complete',
                    message: 'Starting app and watching for changes'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['notify', 'env', 'shell', 'nodemon']);
};
