const gulp = require('gulp');
const sassCompiler = require('sass');
const gulpSass = require('gulp-sass')(sassCompiler);
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const ffmpeg = require('fluent-ffmpeg'); // Alterado para o pacote correto
const through2 = require('through2');
const path = require('path');
const fs = require('fs'); // Adicionado para manipulação de arquivos
const ffmpegStatic = require('ffmpeg-static'); // Adicionado para binários embutidos

// Configurar o caminho do FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

function styles() {
    return gulp.src('./src/styles/*.scss')
        .pipe(gulpSass({
            outputStyle: 'compressed',
            quietDeps: true,
            logger: {
                warn: (message) =>  {
                    // Filtra avisos específicos que queremos ignorar
                    if (!message.includes('legacy') && !message.includes('global-builtin')) {
                        console.warn(message);
                    } 
                }
            }
        }))
        .pipe(gulp.dest('./dist/css'));
}

function scripts() {
    return gulp.src('./src/scripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
}

function images() {
    return gulp.src('./src/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images'));
}

// Função corrigida para conversão de áudio
function audios() {
    return gulp.src('./src/audios/**/*.{wav,flac,ogg,aiff,mp3}')
        .pipe(through2.obj(function(file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }

            // Configurações de conversão
            const outputFormats = ['mp3', 'ogg', 'wav'];
            const fileName = path.basename(file.path, path.extname(file.path));
            
            // Calcula o caminho relativo para manter a estrutura de pastas
            const relativePath = path.relative('./src/audios', path.dirname(file.path));
            const outputDir = path.join('./dist/audios', relativePath);
            
            // Garante que o diretório de destino existe
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            outputFormats.forEach(format => {
                const outputPath = path.join(outputDir, `${fileName}.${format}`);
                
                ffmpeg(file.path)
                    .audioBitrate(128)
                    .audioChannels(2)
                    .toFormat(format)
                    .on('error', (err) => console.error(`Erro ao converter ${file.path} para ${format}:`, err))
                    .on('end', () => console.log(`Conversão concluída: ${outputPath}`))
                    .save(outputPath);
            });

            cb(null, file);
        }));
}

exports.default = gulp.parallel(styles, images, scripts, audios);

exports.watch = function() {
    gulp.watch('./src/styles/*.scss', gulp.parallel(styles));
    gulp.watch('./src/scripts/*.js', gulp.parallel(scripts));
    gulp.watch('./src/audios/**/*', audios); // Alterado para chamar diretamente a função
};