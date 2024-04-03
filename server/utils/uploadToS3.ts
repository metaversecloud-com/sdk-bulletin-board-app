import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler.js";

export async function uploadToS3(imageData: any, fileName: string) {
  try {
    const base64Data = imageData.split(',')[1];
    const binaryData = atob(base64Data);
    const buffer = Buffer.from(binaryData, 'binary');

    const credentials = { region: "us-east-1" };
    const client = new S3Client(credentials);
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `userUploads/${fileName}.png`,
      Body: buffer,
      ContentType: "image/png",
    });

    await client.send(putObjectCommand);

    return { imageUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/userUploads/${fileName}`, success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "uploadToS3",
      message: "Error uploading image to S3",
    });
  }
};
