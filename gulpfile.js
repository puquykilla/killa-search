'use strict';

var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var pump = require('pump');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var dist_dir = 'src/templates/dist';

var config = {
  jsFiles: [
    'src/templates/assets/js/jquery-3.1.1.min.js',

    'src/templates/app/app.js'
  ]
};

gulp.task('css', function () {
  gulp.src('src/templates/assets/css/styles.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(rename({
      basename: "styles",
      suffix: ".min",
      extname: ".css"
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist_dir + '/css'));
})

//Copy fonts to dist/fonts
gulp.task('fonts', function() {
  gulp.src('src/templates/assets/fonts/*')
    .pipe(gulp.dest(dist_dir + '/fonts'));
})

gulp.task('images', function() {
  gulp.src('src/templates/assets/images/*')
    .pipe(gulp.dest(dist_dir + '/images'));
})

gulp.task('js', function() {
  return gulp.src(config.jsFiles)
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', function(e){
        console.log(e);
     }))
    .pipe(concat('app.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist_dir + '/js'));
});

gulp.task('js-prod', function() {
  return gulp.src(config.jsFiles)
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', function(e){
        console.log(e);
     }))
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest(dist_dir + '/js'));
});

// Watch task
gulp.task('watch', function() {
    gulp.watch('src/templates/assets/css/***/**/*.css', ['css']);
    gulp.watch('src/templates/assets/css/**/*.scss', ['css']);
    gulp.watch('src/templates/assets/fonts/*', ['fonts']);
    gulp.watch('src/templates/assets/images/*', ['images']);

    gulp.watch('src/templates/assets/js/*.js', ['js']);
    gulp.watch('src/templates/app/***/**/*.js', ['js']);
    gulp.watch('src/templates/app/**/*.js', ['js']);
    gulp.watch('src/templates/app/*.js', ['js']);
});

gulp.task('default', ['fonts', 'css', 'images', 'js', 'watch']);
gulp.task('prod', ['fonts', 'css', 'images', 'js-prod']);
