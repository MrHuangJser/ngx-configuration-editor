const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');

function copy() {
  return gulp.src('./projects/configuration-editor/src/lib/styles/**/*').pipe(gulp.dest('./dist/configuration-editor/lib/styles'));
}

function lessFn() {
  return gulp
    .src(path.resolve(process.cwd(), './dist/configuration-editor/lib/styles/configuration-editor.less'))
    .pipe(
      less({
        paths: [path.join(__dirname, './projects/configuration-editor/src/lib/styles')]
      })
    )
    .pipe(gulp.dest('./dist/configuration-editor/lib/styles'));
}

exports.default = gulp.series(copy, lessFn);
