import * as cdk from '@aws-cdk/core'
import * as path from 'path'
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as escp from '@aws-cdk/aws-ecs-patterns'
import * as ecs from '@aws-cdk/aws-ecs'
import * as apig from '@aws-cdk/aws-apigatewayv2'

interface DocumentManagementWebServerProps {
    vpc: ec2.IVpc
    api: apig.HttpApi
}

export class DocumentManagementWebserver extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: DocumentManagementWebServerProps) {
        super(scope, id)

        // deploy docker container into the ECR
        const webserverDocker = new DockerImageAsset(this, 'WebserverDockerAsset', {
            directory: path.join(__dirname, '..', 'containers', 'webserver')
        })

        // configure our Fargate service
        // // it will take a look at our vpc (determine how many public/private subnets we have, etc)
        // // puts fargate within the private subnets
        // // puts the ALB within the public subnets
        // // uses just http instead of https because we haven't specified a certificate, fine for demo here
        const fargateService = new escp.ApplicationLoadBalancedFargateService(this, 'WebserverService', {
            vpc: props.vpc,
            taskImageOptions: {
                image: ecs.ContainerImage.fromDockerImageAsset(webserverDocker),
                environment: {
                    SERVER_PORT: "8080",
                    API_BASE: props.api.url!
                },
                containerPort: 8080
            }
        })

        new cdk.CfnOutput(this, 'WebserverHost', {
            exportName: 'WebserverHost',
            value: fargateService.loadBalancer.loadBalancerDnsName
        })
    }
}