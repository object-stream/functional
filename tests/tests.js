'use strict';

const nodeVersion = /^v?(\d+)\./.exec(process.version);

const unit = require('heya-unit');

require('./test_fun');
nodeVersion && +nodeVersion[1] >= 10 && require('./test_gen');

require('./test_take');
require('./test_skip');
require('./test_fold');

unit.run();
