#!/usr/bin/env bash
# Abort if any command (incl. in pipeline) exits with error
set -e
set -o pipefail

# Upload 'swagger.json' to an S3 bucket
# - https://stackoverflow.com/a/42779465
# - https://github.com/awslabs/serverless-application-model/issues/345#issuecomment-408121503
# - https://github.com/awslabs/serverless-application-model/issues/305#issuecomment-375297669
aws s3 cp ./swagger.json "s3://$AWS_S3_BUCKET_NAME/"

# Create CloudFormation templates
sam package --template-file stack-create.json \
            --s3-bucket "$AWS_S3_BUCKET_NAME" \
            --output-template-file stack-create.packaged.yaml
sam package --template-file stack-update.json \
            --s3-bucket "$AWS_S3_BUCKET_NAME" \
            --output-template-file stack-update.packaged.yaml

# Create (or update) CloudFormation stack
sam deploy --template-file stack-create.packaged.yaml \
           --capabilities CAPABILITY_IAM \
           --parameter-overrides \
               AwsS3BucketName="$AWS_S3_BUCKET_NAME" \
               DropboxAppSecret="$DROPBOX_APP_SECRET" \
               DropboxUserId="$DROPBOX_USER_ID" \
               DropboxUserToken="$DROPBOX_USER_TOKEN" \
               GitHubToken="$GITHUB_TOKEN" \
               GitHubUsername="$GITHUB_USERNAME" \
               GitHubRepo="$GITHUB_REPO" \
           --stack-name dropblog
aws cloudformation update-stack --template-url "https://s3.amazonaws.com/$AWS_S3_BUCKET_NAME/stack-update.packaged.yaml" \
                                --stack-name dropblog