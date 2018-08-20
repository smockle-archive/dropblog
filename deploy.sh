#!/usr/bin/env bash
# Abort if any command (incl. in pipeline) exits with error
set -e
set -o pipefail

# Upload 'swagger.json' to an S3 bucket
# https://stackoverflow.com/a/42779465
# https://github.com/awslabs/serverless-application-model/issues/345#issuecomment-408121503
# https://github.com/awslabs/serverless-application-model/issues/305#issuecomment-375297669
aws s3 cp ./swagger.json "s3://$AWS_S3_BUCKET_NAME/"

# Create CloudFormation template
sam package --template-file template.json --s3-bucket "$AWS_S3_BUCKET_NAME" --output-template-file packaged.yaml

# Create (or update) CloudFormation stack
sam deploy --template-file packaged.yaml --parameter-overrides AwsS3BucketName="$AWS_S3_BUCKET_NAME" DropboxAppSecret="$DROPBOX_APP_SECRET" --capabilities CAPABILITY_IAM --stack-name dropblog