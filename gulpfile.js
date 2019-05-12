const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const rsync = require('gulp-rsync');
const execOld = require('child_process').exec;
const path = require('path');

const buildFolder = 'build';
const tsProject = ts.createProject('tsconfig.json');

const exec = (command) => new Promise((resolve, reject) => execOld(command, (err, stdout, stderr) => {
  if (err) return reject(err);
  return resolve(stdout, stderr);
}))

const clean = done => {
  del.sync(buildFolder)
  done();
};

const buildExpress = () => 
  src('./src/**/*.ts')
    .pipe(tsProject())
    .pipe(dest(buildFolder));

const buildReact = () =>
  exec('cd front && npm run build')
    .then(() => new Promise(resolve => 
        src('front/build/**/*.*')
          .pipe(dest(path.join(buildFolder, 'assets')))
          .on('end', resolve)
      )
    )

const buildMisc = () =>
  src(['package.json', 'package-lock.json'])
    .pipe(dest(buildFolder))
  
const build = parallel(buildExpress, buildReact, buildMisc);

const deploy = () => {
  const rsyncConf = {
    progress: true,
    incremental: true,
    relative: true,
    emptyDirectories: true,
    recursive: true,
    // clean: true,
    exclude: [],
  }

  rsyncConf.hostname = '192.168.0.110'; // hostname
  rsyncConf.username = 'pi'; // ssh username
  rsyncConf.destination = '/home/pi/project'; // path where uploaded files go

  return src(buildFolder)
    .pipe(rsync(rsyncConf));
}

// const watchFiles = () => watch(['./src', './front'], series(parallel(series(clean, build, deploy), buildReact), deploy));

module.exports = {
  build: series(clean, build),
  deploy: series(clean, build, deploy),
  // watch: parallel(series(clean, build, deploy), watchFiles),
  // buildReact
}