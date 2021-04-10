import * as cdk from '@aws-cdk/core';
import { Bucket, BucketEncryption } from "@aws-cdk/aws-s3"
import { Networking } from './networking'
import { Tags } from '@aws-cdk/core';
import { DocumentManagementAPI } from './api'
import { DocumentManagementWebserver } from './webserver'
import * as s3Deploy from '@aws-cdk/aws-s3-deployment'
import * as path from 'path'

export class TypescriptCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Create a new, encrypted, S3 bucket for our documents
    // Arguments of this are:
    // // the Stack it exists in (this)
    // // the ID of the resource (the name of the bucket, DocumentsBucket)
    // // a properties object for different values that can be passed in (encryption, etc)
    
    const bucket = new Bucket(this, 'DocumentsBucket', {
      encryption: BucketEncryption.S3_MANAGED
    });

    // deploys items in the documents folder to S3
    new s3Deploy.BucketDeployment(this, 'DocumentsDeployment', {
      sources: [
        s3Deploy.Source.asset(path.join(__dirname, '..', 'documents'))
      ],
      destinationBucket: bucket,
      memoryLimit: 512
    })

    // outputs the bucket name
    new cdk.CfnOutput(this, 'DocumentsBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentsBucketName'
    })

    // creates my VPC
    const networkingStack = new Networking(this, 'NetworkingConstruct', {
      maxAzs: 2
    })

    Tags.of(networkingStack).add('Module', 'Networking')

    // creates my API Gateway
    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', {
      documentBucket: bucket
    })

    Tags.of(api).add('Module', 'API')

    // creates my Fargate container service
    const webserver = new DocumentManagementWebserver(this, 'DocumentManagementWebserver', {
      vpc: networkingStack.vpc,
      api: api.httpApi
    })
 
    Tags.of(webserver).add('Module', 'Webserver')

  }
}
