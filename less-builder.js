const fs = require('fs');
const path = require('path');
const less = require('less');
const chokidar = require('chokidar');
const colors = require('colors/safe');
const moment = require('moment');
const mkdirp = require('mkdirp');

class LessBuilder {
  constructor(config) {
    this.setConfig(config);
  }

  setConfig(config) {
    if (typeof config === 'string') {
      config = {
        target: config,
      };
    }
    this.config = {};
    config = config || {};
    this.config.options = config.options || {};
    this.config.target = config.target || '.';
    this.config.entry = config.entry;
    this.config.output = config.output || this.config.target;
    this.config.options.filename = this.config.entry;
    this.config.less = config.less || less;
    return this;
  }

  log(message) {
    console.log(`[${colors.gray(moment().format('hh:mm:ss'))}] ${message}`);
    return this;
  }

  error(message) {
    console.error(`[${colors.gray(moment().format('hh:mm:ss'))}] ${colors.red(message)}`);
    return this;
  }

  async compile() {
    var file = this.config.entry;
    try {
      if (!path.isAbsolute(file)) {
        file = path.join(process.cwd(), file);
      }
      const css = await this.config.less.render(fs.readFileSync(file).toString(), this.config.options);
      this.output(file, css);
    }
    catch (e) {
      this.error(`${colors.red('compile failed:')} ${colors.cyan(file)}\n${colors.red(e.stack || e.message)}`);
    }
  }

  build() {
    this.log(`Starting ${colors.cyan('Build')}`);
    this.compile();
    return this;
  }

  output(file, css) {
    if (!path.isAbsolute(file)) {
      file = path.join(process.cwd(), file);
    }
    file = file.replace(path.resolve(this.config.target), path.resolve(this.config.output));
    const fileName = file.replace(/\.[^.]*$/, '.css');

    mkdirp(path.dirname(fileName), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      fs.writeFileSync(fileName, css.css);
      this.log(`output ${colors.green(fileName)}`);
    });
  }

  createWatcher() {
    return chokidar.watch(path.join(this.config.target, '**', '*.less'), {
      ignored: /[\/\\]\./,
      persistent: true,
    });
  }

  watch() {
    this.build();
    if (this.watcher) {
      this.close();
    }

    const watcher = this.watcher = this.createWatcher();

    watcher
      // .on('unlink', this.remove.bind(this))
      .once('ready', () => {
        this.log(colors.cyan('監視開始'));
        watcher
          .on('add', this.compile.bind(this))
          .on('change', this.compile.bind(this))
        // watcher.on('all', this.output.bind(this));
      });

    return this;
  }

  close() {
    this.watcher && this.watcher.close();
    this.watcher = null;
    return this;
  }
}

const builder = module.exports = {
  create(config) {
    return new LessBuilder(config);
  },

  watch(config) {
    return builder.create(config).watch();
  },

  build(config) {
    return builder.create(config).build();
  }
};

