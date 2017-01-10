"use strict";
var subscribeSqsToSns = require("../index.js").__subscribeSqsToSns;
console.info("Starting index.js tests");

let awsMock = {
    SQS: function() {}
};

exports.sqsSnsSubscriberTests = {
    "function is imported correctly": function (test) {
        test.equal(typeof(subscribeSqsToSns), "function");
        test.done();
    },
    "function calls callback when completed": function (test) {
        let callback = function() {
            test.done();
        };
        subscribeSqsToSns(awsMock, {}, callback);
    },
    "function doesn't throw if callback is undefined": function (test) {
        subscribeSqsToSns(awsMock);
        test.done();
    },
    "function returns resolved promise when completed": function (test) {
        subscribeSqsToSns(awsMock).then(() => {
            test.done();
        });
    },
    "runs successfully when a region is specified": function (test) {
        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        });
        test.done();
    },
    "specified region is used when creating client": function(test) {
        let region = "us-east-1";
        awsMock.SQS = function(options) {
            test.equal(options.region, region);
            test.done();
        };

        subscribeSqsToSns(awsMock, {
            region: "us-east-1"
        });
    }
};