var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', ['copy', 'compress']);

gulp.task('copy', function () {
    gulp.src('src/navigation.js')
        .pipe(gulp.dest('dist'));

    gulp.src('src/navigation.css')
        .pipe(gulp.dest('dist'));
});


gulp.task('compress', function() {
    gulp.src('src/navigation.js')
        .pipe(uglify({
                mangle: false,
                compress: {
                    drop_debugger: true,
                    dead_code: true,
                    global_defs: {
                        DEBUG: false
                    }
                }
            }
        ))
        .pipe(rename('navigation.min.js'))
        .pipe(gulp.dest('dist'));
});