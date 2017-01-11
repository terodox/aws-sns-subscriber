"use strict";
let AWS = require("aws-sdk");
let extend = require("node.extend");

let defaultOptions = {
    region: null,
    snsTopicArn: null,
    sqsArn: null
};

let getQueueUrl = (sqsClient, options) => {
    let queueArnParts = options.sqsArn.split(":");
    let queueName = queueArnParts[queueArnParts.length - 1];
    return sqsClient.getQueueUrl({
        QueueName: queueName
    }).promise();
};

let subscribe = (aws, options) => {
    let snsClient = new aws.SNS({
        region: options.region
    });

    return snsClient.subscribe({
        TopicArn: options.snsTopicArn,
        Protocol: "sqs",
        Endpoint: options.sqsArn
    }).promise();
};

let internal_subscribeSqsToSns = function (aws, options, callback) {
    options = extend(defaultOptions, options);

    let sqsClient = new aws.SQS({
        region: options.region
    });

    let deferred = Promise.defer();
    subscribe(aws, options)
        .then(() => {
            return getQueueUrl(sqsClient, options);
        }).then(() => {
        if(callback) callback(null, {});
        deferred.resolve({});
    }).catch((error) => {
        if(callback) callback(error);
        deferred.reject(error);
    });

    return {
        promise: function () {
            return deferred.promise;
        }
    };
};

exports.subscribeSqsToSns = function(options, callback) {
    return internal_subscribeSqsToSns(AWS, options, callback);
};

exports.__subscribeSqsToSns = internal_subscribeSqsToSns;

