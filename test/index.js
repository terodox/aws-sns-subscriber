"use strict";
let subscribeSqsToSns = require("../index.js").__subscribeSqsToSns;
console.info("Starting index.js tests");

let snsSubscribe = function () {
    return {
        promise: function() {
            return Promise.resolve({});
        }
    };
};

let snsSubscribeErrorMessage = "Sns subscribe failed";
let snsSubscribeError = function () {
    return {
        promise: function() {
            return Promise.reject(snsSubscribeErrorMessage);
        }
    };
};

let awsMock, awsSnsErrorMock;

exports.sqsSnsSubscriberTests = {
    "setUp": function(callback) {
        awsMock = {
            SQS: function () {},
            SNS: function () {
                return {
                    subscribe: snsSubscribe
                };
            }
        };

        awsSnsErrorMock = {
            SQS: function () {},
            SNS: function () {
                return {
                    subscribe: snsSubscribeError
                };
            }
        };
        callback();
    },
    "function is imported correctly": function (test) {
        test.equal(typeof(subscribeSqsToSns), "function");
        test.done();
    },
    "function calls callback when completed": function (test) {
        let callback = function(error) {
            test.ok(!error);
            test.done();
        };
        subscribeSqsToSns(awsMock, {}, callback);
    },
    "function calls callback when error occurs": function (test) {
        let callback = function(error) {
            test.ok(error);
            test.done();
        };
        subscribeSqsToSns(awsSnsErrorMock, {}, callback);
    },
    "function doesn't throw if callback is undefined": function (test) {
        subscribeSqsToSns(awsMock);
        test.done();
    },
    "function returns resolved promise when completed": function (test) {
        subscribeSqsToSns(awsMock).promise().then(() => {
            test.done();
        });
    },
    "runs successfully when a region is specified": function (test) {
        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        });
        test.done();
    },
    "specified region is used when creating SQS client": function(test) {
        let region = "us-east-1";
        awsMock.SQS = function(options) {
            test.equal(options.region, region);
            test.done();
        };

        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        });
    },
    "specified region is used when creating SNS client": function(test) {
        let region = "us-east-1";
        awsMock.SNS = function(options) {
            test.equal(options.region, region);
            test.done();
            return {
                subscribe: snsSubscribe
            };
        };

        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        });
    },
    "if SNS.subscribe fails, promise is rejected and error message is bubbled": function(test) {
        let errorMessage = "Boom";
        awsMock.SNS = function() {
            return {
                subscribe: function () {
                    return {
                        promise: function () {
                            return Promise.reject(errorMessage);
                        }
                    };
                }
            };
        };

        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        }).promise().catch(function (error) {
            test.equal(error, errorMessage);
            test.done();
        });
    }
};