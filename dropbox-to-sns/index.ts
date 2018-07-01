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
  const XDropboxSignature = event.headers["X-Dropbox-Signature"];
  const rawBody = event.rawBody;

  // Verify environment
  const { DROPBOX_APP_SECRET, AWS_SNS_TOPIC_ARN } = process.env;
  if (!DROPBOX_APP_SECRET || !AWS_SNS_TOPIC_ARN) {
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
    await sns.publish({
      TopicArn: AWS_SNS_TOPIC_ARN,
      Message: "Files were modified in Dropbox"
    });
    return {
      statusCode: 200,
      body: "Message sent"
    };
  } catch (error) {
    throw error;
  }
};
