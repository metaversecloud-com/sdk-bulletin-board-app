import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler.js";

export async function deleteFromS3(id: string) {
  try {
    const credentials = { region: "us-east-1" };
    const client = new S3Client(credentials);

    const deleteObject = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `userUploads/${id}.png`,
    });

    await client.send(deleteObject);

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "deleteFromS3",
      message: "Error deleting image from S3",
    });
  }
};
