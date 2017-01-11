"use strict";
let AWS = require("aws-sdk");
let extend = require("node.extend");

let defaultOptions = {
    region: null,
    snsTopicArn: null,
    sqsArn: null
};

exports.subscribeSqsToSns = function(options, callback) {
    return internal_subscribeSqsToSns(AWS, options, callback);
};

exports.__subscribeSqsToSns = function (aws, options, callback) {
    options = extend(defaultOptions, options);

    let snsClient = new aws.SNS({
        region: options.region
    });

    new aws.SQS({
        region: options.region
    });

    return snsClient.subscribe({
        TopicArn: options.snsTopicArn,
        Protocol: "sqs",
        Endpoint: options.sqsArn
    }).promise().then(() => {
        if(callback) callback();
    });
};

