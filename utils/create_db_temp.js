'use strict';

let db = require('../db');
let logger = require('../logger');
let User = require('../models/user');
let Log = require('../models/models').Log;

User.sync().then(() => {
	Log.sync();

});

