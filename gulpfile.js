var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
// var uglify = require('gulp-uglify');
// var gulpConcat = require('gulp-concat');
// var clean = require('gulp-clean');
// var async = require('async');
// var runSequence = require('run-sequence').use(gulp);


gulp.runSync = function (tasks, cb) {
  var sync = tasks.map(function (t) {
    if (Array.isArray(t)) {
      return gulp.run.bind.apply(gulp.run, [gulp].concat(t));
    }
    return gulp.run.bind(gulp, t);
  });
  async.series(sync, cb);
  return gulp;
};

gulp.task('sass', function () {
  return gulp.src('./client/css/*.scss')
    .pipe(sass({
      errLogToConsole: true,
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./client/css/'));
});

gulp.task('watch', ['sass'], function () {
  gulp.watch('./client/**/*.scss', ['sass']);
});

gulp.task('default', ['sass']);