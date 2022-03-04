const { src, dest, series, parallel, watch } = require("gulp");
const $ = require("gulp-load-plugins")();
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync");
const del = require("del");
const wiredep = require("wiredep").stream;
const reload = browserSync.reload;

function stylesSass() {
  return src("app/styles/*.scss")
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      sass
        .sync({
          outputStyle: "expanded",
          precision: 10,
          includePaths: ["."],
        })
        .on("error", sass.logError)
    )
    .pipe(
      $.autoprefixer({
        overrideBrowserslist: ["> 1%", "last 2 versions", "Firefox ESR"],
      })
    )
    .pipe($.sourcemaps.write())
    .pipe(dest(".tmp/styles"))
    .pipe(reload({ stream: true }));
}

function stylesLess() {
  return src("app/styles/*.less")
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe(
      $.autoprefixer({
        overrideBrowserslist: ["> 1%", "last 2 versions", "Firefox ESR"],
      })
    )
    .pipe($.sourcemaps.write())
    .pipe(dest(".tmp/styles"))
    .pipe(reload({ stream: true }));
}

function scripts() {
  return src("app/scripts/**/*.js")
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write("."))
    .pipe(dest(".tmp/scripts"))
    .pipe(reload({ stream: true }));
}

function html() {
  return (
    src("app/**/*.html")
      .pipe($.useref({ searchPath: [".tmp", "app", "."] }))
      // .pipe($.if('*.js', $.uglify()))
      // .pipe($.if('*.css', $.cssnano()))
      // .pipe($.if('*.html', $.htmlmin({ collapseWhitespace: true })))
      .pipe(dest("dist"))
  );
}

function images() {
  return src("app/images/**/*")
    .pipe(
      $.if(
        $.if.isFile,
        $.cache(
          $.imagemin({
            progressive: true,
            interlaced: true,
            // don't remove IDs from SVGs, they are often used
            // as hooks for embedding and styling
            svgoPlugins: [{ cleanupIDs: false }],
          })
        ).on("error", function (err) {
          console.log(err);
          this.end();
        })
      )
    )
    .pipe(dest("dist/images"));
}

function fonts() {
  return src(
    require("main-bower-files")(
      "**/*.{eot,svg,ttf,woff,woff2}",
      function (err) {}
    ).concat("app/fonts/**/*")
  )
    .pipe(dest(".tmp/fonts"))
    .pipe(dest("dist/fonts"));
}

function extras() {
  return src(["app/*.*", "!app/*.html"], {
    dot: true,
  }).pipe(dest("dist"));
}

function clean() {
  return del([".tmp", "dist"]);
}

function serve() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [".tmp", "app"],
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });

  watch([
    "app/**/*.html",
    ".tmp/scripts/**/*.js",
    "app/images/**/*",
    ".tmp/fonts/**/*",
  ]).on("change", reload);

  watch("app/styles/**/*.scss", series(stylesSass));
  watch("app/styles/**/*.less", series(stylesLess));
  watch("app/scripts/**/*.js", series(scripts));
  watch("app/fonts/**/*", series(fonts));
  watch("bower.json", series(wiredep_styles, wiredep_html, fonts));
}

function serveDist() {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist"],
    },
  });
}

function wiredep_styles() {
  return src("app/styles/*.*")
    .pipe(
      wiredep({
        ignorePath: /^(\.\.\/)+/,
      })
    )
    .pipe(dest("app/styles"));
}

function wiredep_html() {
  return src("app/**/*.html")
    .pipe(
      wiredep({
        ignorePath: /^(\.\.\/)+/,
      })
    )
    .pipe(dest("app"));
}

function build() {
  return src("dist/**/*").pipe($.size({ title: "build", gzip: true }));
}

exports.Wiredep = parallel(wiredep_styles, wiredep_html);
exports.serve = series(parallel(stylesSass, stylesLess, scripts, fonts), serve);
exports.serveDist = serveDist;
exports.build = parallel(
  series(stylesSass, stylesLess, scripts, html),
  images,
  fonts,
  extras
);
exports.default = series(
  clean,
  parallel(series(stylesSass, stylesLess, scripts, html), images, fonts, extras)
);
