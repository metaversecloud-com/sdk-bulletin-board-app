import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler.js";

export async function uploadToS3(imageDataUrl: any, fileName: string) {
  try {
    const base64Data = imageDataUrl.split(',')[1];
    const binaryData = atob(base64Data);
    const buffer = Buffer.from(binaryData, 'binary');

    const credentials = { region: "us-east-1" };
    const client = new S3Client(credentials);
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `userUploads/${fileName}`,
      Body: buffer,
      ContentType: "image/png",
    });

    const result = await client.send(putObjectCommand);
    console.log("🚀 ~ file: uploadToS3.ts:17 ~ result:", result)

    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "uploadToS3",
      message: "Error uploading image to S3",
    });
  }
};
