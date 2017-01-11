"use strict";
let AWS = require("aws-sdk");
let subscribeSqsToSns = require("../index.js").subscribeSqsToSns;

const topicName = "aws-sns-subscriber-integrationTestsTopic";
const queueName = "aws-sns-subscriber-integrationTestsQueue";
let clientOptions = {
    region: "us-east-1"
};
let snsTopicArn, sqsQueueUrl, sqsQueueArn, snsClient, sqsClient;

exports.sqsSnsSubscriberTests = {
    "setUp": function (callback) {
        snsClient = new AWS.SNS(clientOptions);
        sqsClient = new AWS.SQS(clientOptions);
        snsClient.createTopic({
            Name: topicName
        }).promise()
            .then((createResult) => {
                snsTopicArn = createResult.TopicArn;
                console.info("Topic CREATED. Arn:", snsTopicArn);
            }).then(() => {
                return sqsClient.createQueue({
                    QueueName: queueName
                }).promise();
            }).then((createSqsResult) => {
                sqsQueueUrl = createSqsResult.QueueUrl;
                console.info("Queue CREATED. Arn:", sqsQueueUrl);
                return sqsClient.getQueueAttributes({
                    QueueUrl: sqsQueueUrl,
                    AttributeNames: [
                        "QueueArn"
                    ]
                }).promise();
            }). then((getQueueAttributesResult) => {
                sqsQueueArn = getQueueAttributesResult.Attributes.QueueArn;
                callback();
            }).catch((error) => {
                console.error(error);
                throw new Error(error);
            });
    },
    "full integration test": function (test) {
        try {
            subscribeSqsToSns({
                region: "us-east-1",
                sqsArn: sqsQueueArn,
                snsTopicArn: snsTopicArn
            }).promise()
                .then(() => {
                    test.ok(true);
                    test.done();
                }).catch((error) => {
                    console.error(error);
                    test.ok(false);
                    test.done();
                });
        } catch(e) {
            console.error(e);
            test.ok(false);
            test.done();
        }
    },
    "tearDown": function(callback) {
        snsClient.deleteTopic({
            TopicArn: snsTopicArn
        }).promise()
            .then(() => {
                console.info("Topic DELETED. Arn:", snsTopicArn);
            }).then(() => {
                return sqsClient.deleteQueue({
                    QueueUrl: sqsQueueUrl
                }).promise();
            }).then(() => {
                console.info("Queue DELETED. Arn:", sqsQueueUrl);
                callback();
            }).catch((error) => {
                console.error("Topic failed to delete!! Please go delete:", topicName);
                throw new Error(error);
            });
    }
};