const autoPrefixer = require('gulp-autoprefixer')
const fileinclude = require('gulp-file-include')
const ttf2woffGulp = require('gulp-ttf2woff')

let project_folder = "dist"
let source_folder = "src"
let fs = require('fs')

let path = {
   //выгрузка обработанных файлов
   build: {
      html: project_folder + "/",
      css: project_folder + "/css/",
      // js: project_folder + "/js/",
      img: project_folder + "/img/",
      fonts: project_folder + "/fonts/"
   },
   //исходники
   src: {
      html: [source_folder + "/**/*.html", "!" + source_folder + "/**/_*.html"],
      css: source_folder + "/scss/style.scss",
      // js: source_folder + "/js/",
      img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
      fonts: source_folder + "/fonts/*.ttf"
   },
   //файлы которые сразу нужно выполнять
   watch: {
      html: source_folder + "/**/*.html",
      css: source_folder + "/scss/**/*.scss",
      // js: source_folder + "/js/",
      img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
   },
   //обновление dist
   clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
   gulp = require('gulp'),
   browsersync = require('browser-sync').create(),
   fileinclud = require('gulp-file-include'),
   del = require('del'),
   scss = require('gulp-sass'),
   autoprefixer = require('gulp-autoprefixer'),
   group_media = require('gulp-group-css-media-queries'),
   css_clean = require('gulp-clean-css'),
   rename = require('gulp-rename'),
   imagemin = require('gulp-imagemin'),
   webp = require('gulp-webp'),
   webphtml = require('gulp-webp-html'),
   ttf2woff = require('gulp-ttf2woff'),
   ttf2woff2 = require('gulp-ttf2woff2'),
   fonter = require('gulp-fonter')

function browserSync(params) {
   browsersync.init({
      server: {
         baseDir: "./" + project_folder + "/"
      },
      port: 3000,
      notify: false
   })
}

function fonts(params) {
   src(path.src.fonts)
      .pipe(ttf2woff())
      .pipe(dest(path.build.fonts))
   return src(path.src.fonts)
      .pipe(ttf2woff2())
      .pipe(dest(path.build.fonts))
}

function clean() {
   return del(path.clean)
}

function html(params) {
   return src(path.src.html)
      .pipe(fileinclud())
      //.pipe это функции галпа
      .pipe(dest(path.build.html))
      //обновение страницы при сохранении файлов
      .pipe(browsersync.stream())
      .pipe(webphtml())
}
//настройка автообновления браузера
function watchFiles(params) {
   gulp.watch([path.watch.html], html)
   gulp.watch([path.watch.css], css)
   gulp.watch([path.watch.img], images)
}

function css() {
   return src(path.src.css)
      .pipe(
         scss({
            outputStyle: "expanded"
         })
      )
      .pipe(
         group_media()
      )
      .pipe(
         autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
         })
      )
      .pipe(dest(path.build.css))
      .pipe(css_clean())
      .pipe(
         rename({
            extname: ".min.css"
         })
      )
      .pipe(dest(path.build.css))
      .pipe(browsersync.stream())
}

function images(params) {
   return src(path.src.img)
      .pipe(
         webp({
            quality: 70
         })
      )
      .pipe(dest(path.build.img))
      .pipe(src(path.src.img))
      .pipe(
         imagemin({
            progressive: true,
            svgoPlagins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
         })
      )
      .pipe(dest(path.build.img))
      .pipe(browsersync.stream())
}

function fontsStyle(params) {

   let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss')
   if (file_content == '') {
      fs.writeFile(source_folder + '/scss/fonts.scss', '', cb)
      return fs.readdir(path.build.fonts, function (err, items) {
         if (items) {
            let c_fontname;
            for (var i = 0; i < items.length; i++) {
               let fontname = items[i].split('.')
               fontname = fontname[0]
               if (c_fontname != fontname) {
                  fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb)
               }
               c_fontname = fontname
            }
         }
      })
   }
}

function cb() { }

gulp.task('otf2tff', function () {
   return src([source_folder + '/fonts/*.otf'])
      .pipe(fonter({
         formats: ['ttf']
      }))
      .pipe(dest(source_folder + '/fonts/'))
})

let build = gulp.series(clean, gulp.parallel(css, html, images, fonts), fontsStyle)

//по сути дев сервер
let watch = gulp.parallel(build, watchFiles, browserSync)

exports.fontsStyle = fontsStyle
exports.fonts = fonts
exports.images = images
exports.css = css
exports.html = html
exports.build = build
exports.watch = watch
exports.default = watch   