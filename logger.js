"use strict";
var moment = require("moment"),
    winston = require('winston'),
    mkpath = require('mkpath'),
    path = require('path'),
    config = require('./config');


//mkpath.sync(config.logging.file.path , '0777');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console(config.logging.console),
        // new winston.transports.File({
        //     filename:  path.join(config.logging.file.path, 'log_' + moment().format('YYYY-MM-DD_hh-mm-ss') + '_' + process.pid + '.log'),
        //     maxSize: config.logging.file.maxSize,
        //     maxFiles: config.logging.file.maxFiles,
        //     level:  config.logging.file.level,
        //     colorize: false,
        //     json: true,
        //     handleExceptions: true
        // })
    ],
    exitOnError: false
});

module.exports  = logger;
