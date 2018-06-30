import AWS from "aws-sdk";
import { createHmac } from "crypto";

const sns = new AWS.SNS();

type LambdaEvent = {
  headers: {
    "X-Dropbox-Signature": string;
  };
  rawBody: string;
};

export const handler = async (event: LambdaEvent) => {
  // Get request details from 'event'
  const rawBody = new Buffer(event.rawBody);
  const XDropboxSignature = event.headers["X-Dropbox-Signature"];

  // Verify environment
  const { DROPBOX_APP_SECRET, AWS_SNS_ARN } = process.env;
  if (!DROPBOX_APP_SECRET || !AWS_SNS_ARN) {
    throw new Error("Missing environment variable");
  }

  // Make sure this is a valid request from Dropbox
  if (
    createHmac("sha256", DROPBOX_APP_SECRET)
      .update(rawBody)
      .digest("hex") != XDropboxSignature
  ) {
    throw new Error("Invalid X-Dropbox-Signature");
  }

  try {
    return await sns.publish({
      TopicArn: AWS_SNS_ARN,
      Message: "Files were modified in Dropbox"
    });
  } catch (error) {
    throw error;
  }
};
