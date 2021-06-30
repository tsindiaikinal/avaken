// 'use strict';
// const gulp = require("gulp");
const { watch, dest, src } = require("gulp");
const { series } = require("gulp"); 
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const imagemin    = require('gulp-imagemin');
const imageminPngquant = require("imagemin-pngquant");
const imgCompress = require("imagemin-jpeg-recompress");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync").create();
// **************************************************
const watcher = watch([
  "src/*.html",
  "src/js/*.js",
  "src/sass/*.scss",
  "src/css/*.css"
]);
watcher.on("change", function(path, stats) {
  browserSync.reload();
});

watch(["src/sass/*.scss"], function(cb) {
  // body omitted
   sassExt();
    cb();
});

watch("src/**/*.js", function (cb) {
  babelTranspiller();
  cb();
});

const serv = () => {
  browserSync.init({
    server: {
      baseDir: "./src"
    }
  });
};

// const jscript =() => {
//   return src("src/**/*.js")
//     .pipe(sourcemaps.init())
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest("dist/js"));
//   };
  
  const babelTranspiller = () => {
     return src(["src/**/jquery.js", "src/**/script.js"])
         .pipe(sourcemaps.init())
         .pipe(babel())
         // .pipe(rigger())
         .pipe(concat("min.script.js"))
         .pipe(uglify())
        //  .pipe(rename({ suffix: ".min" }))
         .pipe(sourcemaps.write("."))
         .pipe(dest("dist/js"));
};

sass.compiler = require("node-sass");

const sassExt = () => {
    return src("src/sass/**/*.scss")
      .pipe(sass().on("error", sass.logError))
      .pipe(dest("src/css"));
      // .pipe(browserSync.stream());
};
 // src(["src/css/style.css", "src/css/fontface.css"])
const cssminim = () => {
  return src("src/**/*.css")
    .pipe(csso())
    .pipe(concat("min.style.css"))
    // .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/css"));
}
const copy = () => {
  return (
    src("src/**/*.html").pipe(dest("dist")) &&
    src("src/fonts/*").pipe(dest("dist/fonts"))
  )
};

const imageMin = () => {
  return src("src/img/**/*.+(jpg|jpeg|png|svg)")
    .pipe(imagemin())
    .pipe(
      imagemin([
        imgCompress({
          loops: 4,
          min: 70,
          max: 80,
          quality: "high"
        }),
        imagemin.gifsicle({ interlaced: true }),
        // imagemin.optipng({ optimizationLevel: 5 }),
        imageminPngquant(['quality: 80']),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        })
      ])
    )
    .pipe(dest("dist/img"));
}

// exports.serv = serv;
// exports.sassExt = sassExt;
// exports.sasswatch = sasswatch;
exports.babelTranspiller = babelTranspiller;
exports.build = series(cssminim, imageMin, copy);
exports.dev = series(serv);
