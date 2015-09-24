var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    livereload = require('gulp-livereload');

gulp.task('default', ['http_server', 'copy', 'compress', 'watch']);

gulp.task('copy', function () {
    gulp.src('src/navigation.js')
        .pipe(gulp.dest('dist'));

    gulp.src('src/navigation.css')
        .pipe(gulp.dest('dist'));

    gulp.src('src/navigation.js')
        .pipe(gulp.dest('demo'));

    gulp.src('src/navigation.css')
        .pipe(gulp.dest('demo'));
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

// Смотрящий за изменениями в файлах и запускает частичную компиляцию
gulp.task('watch', function () {
    livereload.listen();

    // Изменения в js приложения
    gulp.watch(
        ['./src/**/*'],
        {
            interval: 200,
            debounceDelay:50
        },
        ['copy', 'compress']
    );

    // Поддержка LiveReload плагина
    gulp.watch(
        ['./demo/**/*']
    ).on('change', livereload.changed);
    return;
});

gulp.task('http_server', function() {
    connect.server({root: 'demo'});
    return;
});