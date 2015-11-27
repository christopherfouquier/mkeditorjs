'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var minifyHTML = require('gulp-minify-html');

gulp.task('lint', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts:prod', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(concat('mkeditor.js'))
    .pipe(rename('mkeditor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('scripts:dev', function() {
  return gulp.src('./src/js/**/*.js')
    .pipe(concat('mkeditor.js'))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('scripts', ['scripts:prod', 'scripts:dev']);

gulp.task('sass:prod', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(rename('mkeditor.min.css'))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('sass:dev', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass())
    .pipe(rename('mkeditor.css'))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('sass', ['sass:prod', 'sass:dev']);

gulp.task('html', function() {
  return gulp.src('./src/**/*.html')
    .pipe(minifyHTML({ conditionals: true, spare: true }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['default']);
  gulp.watch('./src/js/**/*.js', ['default']);
  gulp.watch('./src/**/*.html', ['default']);
});

gulp.task('default', ['scripts', 'sass', 'html']);
gulp.task('lint', ['lint']);
gulp.task('dev', ['watch']);