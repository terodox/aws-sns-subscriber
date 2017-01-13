"use strict";
let AWS = require("aws-sdk");
let extend = require("node.extend");
let md5 = require("md5");
let deepEqual = require("deep-equal");

let defaultOptions = {
    region: null,
    snsTopicArn: null,
    sqsArn: null
};

let sqsUpdatePolicy = (sqsClient, queueUrl, policy) => {
    return sqsClient.setQueueAttributes({
        QueueUrl: queueUrl,
        Attributes: {
            Policy: policy
        }
    }).promise();
};

let getPolicyFromGetQueueAttributesResponse = (getQueueAttributesResponse) => {
    let policy;

    if(!getQueueAttributesResponse.hasOwnProperty("Attributes")) {
        getQueueAttributesResponse.Attributes = {};
    }
    if(getQueueAttributesResponse.Attributes.hasOwnProperty("Policy")) {
        policy = getQueueAttributesResponse.Attributes.Policy;
    }
    if(!policy) {
        return null;
    }
    return JSON.parse(policy);
};

let updatePolicyIfNecessary = (policy, options) => {
    let sid = md5(options.snsTopicArn + options.sqsArn);

    let finalPolicy = policy;
    if(!policy){
        finalPolicy = {};
        finalPolicy.Version = "2012-10-17";
    }
    if(!finalPolicy.hasOwnProperty("Statement")) {
        finalPolicy.Statement = [];
    }

    let policyAlreadyExists = false;
    for(let statementLoop = 0; statementLoop < finalPolicy.Statement.length; statementLoop++) {
        if(finalPolicy.Statement[statementLoop].Sid == sid) {
            policyAlreadyExists = true;
        }
    }

    if(policyAlreadyExists) return policy;

    let newStatement = {
        Action: "SQS:SendMessage",
        Effect: "Allow",
        Principal: {
            AWS: "*"
        },
        Resource: options.sqsArn,
        Sid: sid,
        Condition: {
            ArnEquals: {
                "aws:SourceArn": options.snsTopicArn
            }
        }
    };

    finalPolicy.Statement.push(newStatement);

    return JSON.stringify(finalPolicy);
};

let getQueuePolicy = (sqsClient, queueUrl) => {
    return sqsClient.getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: [
            "Policy"
        ]
    }).promise();
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
    let queueUrl;
    subscribe(aws, options)
        .then(() => {
            return getQueueUrl(sqsClient, options);
        }).then((getQueueUrlResponse) => {
            queueUrl = getQueueUrlResponse.QueueUrl;
            return getQueuePolicy(sqsClient, queueUrl);
        }).then((getQueuePolicyResponse) => {
            let policy = getPolicyFromGetQueueAttributesResponse(getQueuePolicyResponse);
            let updatedPolicy = updatePolicyIfNecessary(policy, options);
            if(deepEqual(policy, updatedPolicy)) {
                return Promise.resolve();
            }
            return sqsUpdatePolicy(sqsClient, queueUrl, updatedPolicy);
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

