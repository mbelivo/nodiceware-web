var gulp = require('gulp');
var babel = require('gulp-babel');
var cssnext = require('postcss-cssnext');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
    css: 'src/css/**/*.css',
    js: 'src/js/**/*.js',
    static: 'static',
};


gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())
        .pipe(postcss([cssnext]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.static + '/css'));
});


gulp.task('js', function() {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['env'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.static + '/js'));
});


gulp.task('watch', function() {
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.js, ['js']);
});


gulp.task('default', ['css', 'js']);
