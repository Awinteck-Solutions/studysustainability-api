import * as dotenv from "dotenv";
import { Readable } from "stream";
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

dotenv.config();

const bucketName = process.env.S3_BUCKET as string;
const region = process.env.S3_REGION as string;

// IAM role or env credentials will be used automatically
const s3Client = new S3Client({ region });

const timestamp = new Date().getMilliseconds();

// Define file type (similar to Multer's File type)
interface UploadFile {
  buffer: Buffer;
  originalname: string;
}

// ✅ Uploads a file to S3
export async function uploadFile(file: UploadFile, folder: string) {
  const fileStream = Readable.from(file.buffer);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: `${folder}/${timestamp}_${file.originalname.replace(/\s/g, "")}`,
      Body: fileStream,
    },
  });

  return upload.done();
}

// ✅ Downloads a file from S3
export async function getFileStream(
  fileKey: string,
  callback: (result: { stream: NodeJS.ReadableStream; contentLength: number }) => void
) {
  try {
    // First check metadata
    const head = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: fileKey })
    );

    const contentLength = head.ContentLength ?? 0;

    // Get file stream
    const response = await s3Client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: fileKey })
    );

    const stream = response.Body as NodeJS.ReadableStream;

    callback({ stream, contentLength });
  } catch (err) {
    console.error("Error downloading file:", err);
  }
}
