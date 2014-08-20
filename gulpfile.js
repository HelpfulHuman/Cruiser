var gulp        = require('gulp'),
    clean       = require('gulp-rimraf'),
    coffee      = require('gulp-coffee'),
    coffeelint  = require('gulp-coffeelint'),
    mocha       = require('gulp-mocha');

gulp.task('clean', function()
{
  return gulp.src('./lib', {read: false})
  .pipe(clean());
});

gulp.task('scripts', ['clean'], function()
{
  return gulp.src('./src/**/*.coffee')
  .pipe(coffeelint())
  .pipe(coffee({bare:true}))
  .pipe(gulp.dest('./lib'));
});

gulp.task('test', ['scripts'], function()
{
  require('coffee-script/register');
  return gulp.src('./test/**/*.coffee')
  .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function()
{
  gulp.watch('./src/**/*.coffee', ['scripts']);
  gulp.watch('./test/**/*.coffee', ['test']);
})

gulp.task('default', ['clean', 'scripts', 'test']);

