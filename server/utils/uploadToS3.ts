import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { errorHandler } from "./errorHandler";

export async function uploadToS3(file, fileName) {
  try {
    console.log("🚀 ~ file: uploadToS3.ts:5 ~ file:", file)
    const Body = new File([file], fileName);

    const credentials = {
      region: "us-east-1",
      // credentials: {
      //   accessKeyId: process.env.S3_KEY,
      //   secretAccessKey: process.env.S3_SECRET
      // }
    };
    const client = new S3Client(credentials);

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      // Body: "hello world!",
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
