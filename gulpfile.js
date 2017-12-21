var gulp = require('gulp');
var babel = require('gulp-babel');
var cssnext = require('postcss-cssnext');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
    css: 'src/css/**/*.css',
    html: 'src/html/**/*.html',
    js: 'src/js/**/*.js',
    dist: {
        'css': 'static/dist/css',
        'html': 'static/dist/html',
        'js': 'static/dist/js'
    }
};


gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(sourcemaps.init())
        .pipe(postcss([cssnext]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css));
});


gulp.task('html', function() {
    return gulp.src(paths.html)
        .pipe(gulp.dest(paths.dist.html));
});


gulp.task('js', function() {
    return gulp.src(paths.js)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['env'] }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.js));
});


gulp.task('browser-sync', function() {
    var browserSync = require('browser-sync').create();

    browserSync.init({
        files: [paths.dist.css + '/*.css', paths.dist.js + '/*.js', paths.dist.html + '/*.html'],
        open: false,
        proxy: 'localhost:5000'
    });
});


gulp.task('run-server', function() {
    var exec = require('child_process').exec;
    var env = Object.create(process.env);

    env.FLASK_APP = 'nodiceware.py';
    env.FLASK_DEBUG = process.env.NODE_ENV === 'production' ? 0 : 1;

    exec('flask run', { env: env }, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
});


gulp.task('watch', function() {
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.js, ['js']);
});


gulp.task('serve', ['watch', 'run-server', 'browser-sync']);
gulp.task('default', ['css', 'js']);
