/* jshint node: true */
(function () {
	"use strict";

	module.exports = function (grunt) {

		var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
		var user = 'ESERVICES';
		var psw = 'ab123456';
		var Auth = 'Basic ' + Buffer.from(user+":"+psw).toString('base64');

		grunt.initConfig({
			dir: {
				webapp: 'app',
				dist: 'dist',
				bower_components: 'bower_components'
			},
			app: {
				prefix: "<%= app_name %>",
				version: "1.0.0"
			},
			jshint: {
				all: ['Gruntfile.js', '<%= dir.webapp %>/**/*.js'],
				options: {
					jshintrc: '.jshintrc',
					jshintignore: '.jshintignore'
				}
			},
			jsvalidate: {
				options: {
					globals: {},
					esprimaOptions: {},
					verbose: false
				},
				targetName: {
					files: {
						src: ['<%=jshint.all%>']
					}
				}
			},
			connect: {
				options: {
					port: 9880,
					hostname: '*',
					middleware: function (connect, options, defaultMiddleware) {
						return [proxySnippet].concat(defaultMiddleware);
					}
				},
				src: {},
				dist: {},
				proxies: [{
						context: "/XMII/Runner", // When the url contains this...
						host: "172.19.112.154", // Proxy to this host
						port: 52000,
						changeOrigin: true,
						headers: {
							"Authorization": Auth
						}
					}, {
						context: "/XMII/Illuminator", // When the url contains this...
						host: "172.19.112.154", // Proxy to this host
						port: 52000,
						changeOrigin: true,
						headers: {
							"Authorization": Auth
						}
					}
				]
			},
			openui5_connect: {
				options: {},
				src: {
					options: {
						appresources: '<%= dir.webapp %>'
					}
				},
				dist: {
					options: {
						appresources: '<%= dir.dist %>'
					}
				}
			},
			openui5_preload: {
				component: {
					options: {
						resources: {
							cwd: '<%= dir.webapp %>',
							prefix: '<%= app.prefix %>'
						},
						dest: '<%= dir.dist %>'
					},
					components: true
				}
			},
			clean: {
				dist: {
					src: ['<%= dir.dist %>/**']
				}
			},
			copy: {
				dist: {
					files: [{
							expand: true,
							cwd: '<%= dir.webapp %>',
							src: [
								'**',
								'!controller/*.js',
								'!model/*.js',
								'!model/pwd4proxy.json',
								'!utils/*.js',
								'!view/*.xml',
								'!test/**',
								'!META-INF/**',
								'!WEB-INF/**',
								'!.idea/**',
								'!index_test.html'
							],
							dest: '<%= dir.dist %>'
						}, {
							expand: true,
							cwd: './',
							src: [
								'.Ui5RepositoryIgnore'
							],
							dest: '<%= dir.dist %>'
						}
					]
				},
				test: {
					files: [{
							expand: true,
							cwd: '<%= dir.webapp %>',
							src: [
								'**',
								'!META-INF/**',
								'!WEB-INF/**',
								'!.idea/**'
							],
							dest: '<%= dir.dist %>'
						}, {
							expand: true,
							cwd: './',
							src: [
								'.Ui5RepositoryIgnore'
							],
							dest: '<%= dir.dist %>'
						}
					]
				}
			},
			eslint: {
				webapp: ['<%= dir.webapp %>']
			},
			'string-replace': {
				inline: {
					files: {
						'<%= dir.dist %>/index.html': '<%= dir.dist %>/index.html'
					},
					options: {
						replacements: [{
								pattern: 'src=\"resources/sap-ui-core.js\"',
								replacement: 'src=\"resources/sap-ui-core.js\"',
							}
						]
					}
				}
			},
			sync: {
				main: {
					files: [{
							expand: true,
							cwd: '<%= dir.webapp %>',
							src: [
								'**',
								'!META-INF/**',
								'!WEB-INF/**',
								'!.idea/**'
							],
							dest: '<%= dir.dist %>'
						}
					],
					failOnError: true,
					verbose: true, // Display log messages when copying files
					compareUsing: "md5" // compares via md5 hash of file contents, instead of file modification time. Default: "mtime"
				}
			},
			watch: {
				files: ['Gruntfile.js', '<%= dir.webapp %>/**/*.js', '<%= dir.webapp %>/**/*.xml', '<%= dir.webapp %>/**/*.html', '<%= dir.webapp %>/**/*.css', '<%= dir.webapp %>/**/*.json', '<%= dir.webapp %>/**/*.properties'],
				tasks: ['buildSync'],
				options: {
					livereload: true
				}
			}

		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-jsvalidate');
		grunt.loadNpmTasks('grunt-contrib-connect');
		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.loadNpmTasks('grunt-contrib-copy');
		grunt.loadNpmTasks('grunt-openui5');
		grunt.loadNpmTasks('grunt-eslint');
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-sync');
		grunt.loadNpmTasks('grunt-string-replace');
		grunt.loadNpmTasks('grunt-connect-proxy');

		// Server task
		grunt.registerTask('serve', function (target) {
			grunt.task.run('openui5_connect:' + (target || 'src') + '');
		});

		// Compile task
		//grunt.registerTask('compile', ['jsvalidate', 'jshint', 'eslint']);

		// JSHint task
		grunt.registerTask('hint', ['jshint']);

		// Linting task
		grunt.registerTask('lint', ['eslint']);

		// Build task
		//grunt.registerTask('build', ['compile', 'openui5_preload', 'copy:dist', 'string-replace']);
		//grunt.registerTask('build', ['compile', 'copy:dist', 'openui5_preload']);
		grunt.registerTask('build', ['copy:dist', 'openui5_preload']);

		// Copy sync mode
		grunt.registerTask('copySync', 'sync');

		// Build sync
		grunt.registerTask('buildSync', ['copySync']);

		// Build test
		grunt.registerTask('build_test', ['buildSync', 'copy:test']);

		// Watch task
		grunt.registerTask('mywatch', ['watch']);

		// Default task
		grunt.registerTask('default', [
				'build_test',
				'configureProxies:server',
				'serve:dist',
				'watch'
			]);
	};

}
	());
