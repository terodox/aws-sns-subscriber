"use strict";
let AWS = require("aws-sdk");
let extend = require("node.extend");

let defaultOptions = {
    region: null
};

exports.subscribeSqsToSns = function(options, callback) {
    return internal_subscribeSqsToSns(AWS, options, callback);
};

exports.__subscribeSqsToSns = function (aws, options, callback) {
    options = extend(defaultOptions, options);

    new aws.SQS({
        region: options.region
    });

    if(callback) callback();
    return Promise.resolve();
};

