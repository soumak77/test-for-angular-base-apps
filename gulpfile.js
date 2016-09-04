var argv     = require('yargs').argv;
var gulp     = require('gulp');
var rimraf   = require('rimraf');
var baseAppsRouter   = require('base-apps-router');
var sequence = require('run-sequence');

var gulpCleanCss = require('gulp-clean-css');
var gulpIf = require('gulp-if');
var gulpUglify = require('gulp-uglify');
var gulpBeautify = require('gulp-beautify');
var gulpConcat = require('gulp-concat');
var gulpSass = require('gulp-sass');

var gulpRename = require("gulp-rename");
var gulpAutoprefixer = require("gulp-autoprefixer");

// Check for --production flag
var isProduction = !!(argv.production);

if(isProduction) {
	console.log('production');
}

var buildPath = './build';

var paths = {
	in: {
		app: './app',
		indexFile: './app/index.html',
		templates: [
			'./app/**/*.html',
			'!./app/index.html',
		],
		sass: {
			appFile: './app/scss/app.scss',
			include: [
				'./app/scss',
				'./bower_components/angular-base-apps/scss',
			],
		},
		angular: [
			'./bower_components/fastclick/lib/fastclick.js',
			'./bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
			'./bower_components/tether/tether.js',
			'./bower_components/hammerjs/hammer.js',
			'./bower_components/lodash/dist/lodash.js',
			
			'./bower_components/angular/angular.js',

			'./bower_components/angular-animate/angular-animate.js',
			'./bower_components/angular-ui-router/release/angular-ui-router.js',

			'./node_modules/angular-dynamic-routing/dynamicRouting.js',
			'./node_modules/angular-dynamic-routing/dynamicRouting.animations.js',

			'./bower_components/angular-base-apps/dist/js/base-apps.js',
			
		],
		appJS: [
			'./app/app.js',
		]
	},
	out: {
		build: buildPath,
		templates: buildPath,
		
		routesJsPathFile: buildPath + '/routes.js',

		cssFile: 'app.css',
		cssPath: buildPath,

		angularJsFile: 'angular.js',
		angularJsPath: buildPath,

		langJsFile: 'lang.js',
		langJsPath: buildPath,

		appJsFile: 'app.js',
		appJsPath: buildPath,
	}
}

gulp.task('clean', function(cb) {
	rimraf(paths.out.build, cb);
});

gulp.task('copy:index', function() {
	return gulp
		.src(paths.in.indexFile, {
			base: paths.in.app
		})
		.pipe(gulp.dest(paths.out.build))
	;
});

gulp.task('copy:templates', function() {
	return gulp
		.src(paths.in.templates, { base: paths.in.app })
		.pipe(baseAppsRouter({
			path: paths.out.routesJsPathFile,
			root: paths.in.app
		}))
		.pipe(gulp.dest(paths.out.templates))
	;
});

gulp.task('sass', function () {
	
	return gulp.src(paths.in.sass.appFile)
		.pipe(gulpSass({
			includePaths: paths.in.sass.include,
			outputStyle: (isProduction ? 'compressed' : 'nested'),
			errLogToConsole: true
		}))
		.pipe(gulpAutoprefixer({
			browsers: ['last 2 versions', 'ie 10']
		}))
		.pipe(gulpIf(isProduction, gulpCleanCss()))
		.pipe(gulpRename(paths.out.cssFile))
		.pipe(gulp.dest(paths.out.cssPath))
	;
});

gulp.task('uglify:angular', function() {
	
	return gulp.src(paths.in.angular)
		.pipe(gulpIf(isProduction, gulpUglify(), gulpBeautify()))
		.pipe(gulpConcat(paths.out.angularJsFile))
		.pipe(gulp.dest(paths.out.angularJsPath))
	;
});

gulp.task('uglify:app', function() {

	return gulp.src(paths.in.appJS)
		.pipe(gulpIf(isProduction, gulpUglify(), gulpBeautify()))
		.pipe(gulpConcat(paths.out.appJsFile))
		.pipe(gulp.dest(paths.out.appJsPath))
	;
});

gulp.task('build', function(cb) {
	sequence('clean', ['copy:index', 'copy:templates', 'sass', 'uglify:angular', 'uglify:app'], cb);
});

gulp.task('watch', function () {
	function watchWithOnChange(glob, tasks) {
		return gulp.watch(glob, tasks)
			.on('change', function(event) {
				console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
			});
	}
	
	watchWithOnChange(paths.in.indexFile, ['copy:index']);

	watchWithOnChange(paths.in.templates, ['copy:templates']);

	var includeToWatch = paths.in.sass.include.map(function(currentValue) { return currentValue + '/**/*'; });
	
	watchWithOnChange([paths.in.sass.appFile].concat(includeToWatch), ['sass']);

	watchWithOnChange(paths.in.angular, ['uglify:angular']);

	watchWithOnChange(paths.in.appJS, ['uglify:app']);
	
});

gulp.task('default', function(cb) {
	sequence(['build'], ['watch'], cb);
});
