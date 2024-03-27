import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler";

export async function uploadToS3(file, fileName) {
  try {
    const Body = new File([file], fileName);

    const credentials = { region: "us-east-1" };
    const client = new S3Client(credentials);

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body,
      ContentType: "image/png",
    });

    await client.send(putObjectCommand);

    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "uploadToS3",
      message: "Error uploading image to S3",
    });
  }
};
