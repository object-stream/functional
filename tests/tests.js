'use strict';

const nodeVersion = /^v?(\d+)\./.exec(process.version);

const unit = require('heya-unit');

require('./test_fun');
require('./test_fun_take');
require('./test_fun_skip');
require('./test_fun_fold');

if (nodeVersion && +nodeVersion[1] >= 10) {
  require('./test_gen');
  require('./test_gen_take');
  require('./test_gen_skip');
  require('./test_gen_fold');
  }

unit.run();
