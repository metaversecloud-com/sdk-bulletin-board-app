import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler.js";

export async function deleteFromS3(id: string) {
  try {
    const credentials = { region: "us-east-1" };
    const client = new S3Client(credentials);

    const deleteObject = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `userUploads/${id}`,
    });

    const result = await client.send(deleteObject);
    console.log("🚀 ~ file: uploadToS3.ts:17 ~ result:", result)

    return { success: true };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "deleteFromS3",
      message: "Error deleting image from S3",
    });
  }
};
