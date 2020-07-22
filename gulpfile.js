var gulp = require('gulp'),
	uglify = require('gulp-uglify-es').default,
	sourcemaps = require('gulp-sourcemaps'),
	util = require('gulp-util'),
	watch = require('gulp-watch'),
	zip = require('gulp-zip'),
	fs = require('fs'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer');



function bundle_gspublic() {
	return browserify({ entries: 
            [
		        'vendor/sha256.min.js',
		        'contentscripts/gconsole.js',
		        'contentscripts/gs_cdb.js',
		        'contentscripts/gs_dfp.js',
		        'contentscripts/gs_prebid.js',
		        'contentscripts/gs_index.js',
		        'contentscripts/gs_adfox.js',
		        'contentscripts/gs_pubmatic.js'
            ], debug: true })
			.bundle()
			.on('error', err => {
				util.log('Browserify Error', util.colors.red(err.message))
			})
			.pipe(source('gs_public.js'))
			.pipe(buffer())
			.pipe(uglify())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('./maps/'))
			.pipe(gulp.dest('./contentscripts/'));
}

function create_zip_archive() {
	var json = JSON.parse(fs.readFileSync('./manifest.json'));
	console.log('Version:', json.version);

    return gulp.src([
    			'background/**/*.js',
    			'common/**/*.js',
    			'contentscripts/**/*.js',
    			'contentscripts/**/*.js.map',
    			'images/**/*.png',
    			'images/**/*.jpg',
    			'options/**/*.html',
    			'options/**/*.js',
    			'popup/**/*.html',
    			'popup/**/*.js',
    			'vendor/**',
	    		'manifest.json'
	    	], { base : './'})
	        .pipe(zip('archive-'+json.version+'.zip'))
	        .pipe(gulp.dest('./'));
}

const main = gulp.series(bundle_gspublic, create_zip_archive);

gulp.task('build', main);

gulp.task('zip', create_zip_archive);

gulp.task('watch', function() {
	return watch([
			'./contentscripts/*.js',
			'!./contentscripts/gs_public.js'
		], main)
});