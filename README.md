# aws-sns-subscriber

#### Master: [![Build Status](https://travis-ci.org/terodox/aws-sns-subscriber.svg?branch=master)](https://travis-ci.org/terodox/aws-sns-subscriber) Release: [![Build Status](https://travis-ci.org/terodox/aws-sns-subscriber.svg?branch=release)](https://travis-ci.org/terodox/aws-sns-subscriber)

A package for helping with the more complex forms of SNS subscriptions within AWS.  Specifically subscribing SQS and Lambdas.

Both of these process require extra permissioning steps during the subscription process which can be a bit of a pain to figure out.

This package supplies one basic command for now (Lambdas coming shortly)
#### Methods:
```
var snsSubscriber = require("aws-sns-subscriber");

// Callback form
snsSubscriber.subscribeSqsToSns({
                region: "us-east-1",
                sqsArn: sqsQueueArn,
                snsTopicArn: snsTopicArn
            }, callback);
            
// Promise form
snsSubscriber.subscribeSqsToSns({
                region: "us-east-1",
                sqsArn: sqsQueueArn,
                snsTopicArn: snsTopicArn
            }).prmoise()
            .then((subscriptionResult) => {});
```

The goal with this was to follow the pre-established promise methodology from the aws-sdk. You can choose either for and both will work.

#### Input Object:
```
{
    region: "[aws-region]", // required
    sqsArn: "ARN for the sqs queue being subscribed to SNS", // required
    snsTopicArn: "ARN for sns topic being subscribed to" // required
}
```

#### Output Object:
```
{} // Nothing to output yet, potentially all of the objects created in the future
```

The last note: This is currently only functional for environments with native Promise support.  I have not added support for providing your own promise implementation.