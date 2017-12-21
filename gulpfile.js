var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
	css: 'src/css/**/*.css',
	static: 'static',
}

gulp.task('css', function() {
	var postcss = require('gulp-postcss');
	var cssnext = require('postcss-cssnext');

	return gulp.src(paths.css)
		.pipe(sourcemaps.init())
		.pipe(postcss([cssnext]))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.static + '/css'));
});

gulp.task('watch', function() {
	gulp.watch(paths.css, ['css']);
});

gulp.task('default', ['css']);
