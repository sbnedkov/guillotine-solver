require('babel-polyfill');

var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');
var del = require('del');

gulp.task('watch-src', function () {
    return gulp.watch(['src/**/*.js', 'test/**/*.js'], () => gulp.series('test'));
});

gulp.task('clean', function (cb) {
    return del([
        'dist/**/*',
        'dist-test/**/*'
    ], cb);
});

gulp.task('run-babel', gulp.series('clean', function () {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['stage-0', 'es2015'],
            plugins: ['transform-object-assign', 'transform-regenerator']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
}));

gulp.task('babelify-tests', gulp.series(['run-babel'], function () {
    return gulp.src('test/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['stage-0', 'es2015'],
            plugins: ['transform-object-assign', 'transform-regenerator']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist-test'));
}));

gulp.task('test', gulp.series(['run-babel', 'babelify-tests'], function () {
    return gulp.src('dist-test/**/*.js', {read: false})
        .pipe(mocha({reporter: 'min', timeout: 50000}))
        .once('error', function (err) {
            console.log(err);
            console.log('Continue...');
        });
}));

gulp.task('dev', gulp.series(['test', 'watch-src']));

gulp.task('build', gulp.series('run-babel'));

module.exports = gulp;
