'use strict';
const { watch, dest, src, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
// const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const minify = require("gulp-babel-minify");
const concat = require("gulp-concat");
const csso = require("gulp-csso");
const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imgCompress = require("imagemin-jpeg-recompress");
// const uglify = require("gulp-uglify");
const browserSync = require("browser-sync").create();
// **************************************************

let prodFolder = "dist";
let devFolder = "src";

let path = {
  build: {
    html: prodFolder + "/",
    css: prodFolder + "/css/",
    js: prodFolder + "/js/",
    img: prodFolder + "/img/",
    fonts: prodFolder + "/fonts/",
  },
  src: {
    html: devFolder + "/*.html",
    scss: devFolder + "/sass/*.scss",
    css: devFolder + "/css/",
    js: devFolder + "/js/script.js",
    img: devFolder + "/img/**/*.{jpg,jpeg,png,svg}",
    fonts: devFolder + "/fonts/*.ttf",
  },
  observe: {
    html: devFolder + "/**/*.html",
    scss: devFolder + "/sass/**/*.scss",
    css: devFolder + "/css/**/*.css",
    js: devFolder + "/js/**/*.js",
    img: devFolder + "/img/**/*.{jpg,jpeg,png,svg}",
  },
  clean: "./" + prodFolder + "/",
};

const watcher = watch([
  path.observe.html,
  path.observe.scss,
  path.observe.css,
  path.observe.js
]);

/* const watcher = watch([
  "src/*.html",
  "src/js/*.js",
  "src/sass/*.scss",
  "src/css/*.css",
]); */
watcher.on("change", function (path, stats) {
  browserSync.reload();
});

watch(path.src.scss, function (cb) {
  sassExt();
  cb();
  browserSync.reload();
});

watch(path.src.js, function (cb) {
  cb();
});

function serv() {
  browserSync.init({
    server: {
      baseDir: "./src",
    },
  });
};

function babelTranspiller () {
  return src([path.src.js]).pipe(babel()).pipe(dest("src/out-js/"));
};

function concatjs() {
  return src(["src/out-js/script.js"])
    .pipe(concat("min.main.js"))
    .pipe(
      minify({
        simplify: true,
        booleans: true,
        builtIns: true,
        consecutiveAdds: true,
        deadcode: false,
        evaluate: true,
        flipComparisons: true,
        guards: true,
        infinity: true,
        memberExpressions: true,
        mergeVars: true,
        numericLiterals: true,
        propertyLiterals: true,
        regexpConstructors: true,
        removeConsole: false,
        removeDebugger: false,
        removeUndefined: true,
        replace: true,
        simplifyComparisons: true,
        typeConstructors: true,
        undefinedToVoid: true,
        mangle: {
          keepClassName: true,
        },
      })
    )
    .pipe(dest(path.build.js));
};

function sassExt() {
  return src(path.src.scss)
    .pipe(sass({
      outputStyle: "expanded"
    }).on("error", sass.logError))
    .pipe(dest(path.build.css))
    .pipe(dest(path.src.css));
};

function cssminim() {
  return src([path.src.css])
    .pipe(csso())
    .pipe(concat("min.styles.css"))
    .pipe(dest(path.build.css));
};

function copy() {
  return (
    src(path.src.html).pipe(dest("dist")) &&
    src("src/fonts/*").pipe(dest("dist/fonts/"))
  );
};

function imageMin() {
  return src("src/img/**/*.+(jpg|jpeg|png|svg)")
    .pipe(imagemin())
    .pipe(
      imagemin([
        imgCompress({
          loops: 4,
          min: 70,
          max: 80,
          quality: "high",
        }),
        imagemin.gifsicle({ interlaced: true }),
        // imagemin.optipng({ optimizationLevel: 5 }),
        imageminPngquant(["quality: 80"]),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest(path.build.img));
};

// exports.sassExt = sassExt;
exports.babelTranspiller = babelTranspiller;
exports.concatjs = concatjs;
exports.build = series(cssminim, imageMin, copy);
exports.dev = parallel(serv);
