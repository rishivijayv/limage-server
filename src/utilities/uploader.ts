import AWS from "aws-sdk";
import stream from "stream";
import { S3UploadConfig } from "../types";

type S3UploadStream = {
    writeStream: stream.PassThrough;
    promise: Promise<AWS.S3.ManagedUpload.SendData>
}

export class Uploader {
    private s3: AWS.S3;
    public config: S3UploadConfig;

    constructor(config: S3UploadConfig) {
        AWS.config = new AWS.Config();
        AWS.config.update({
            region: config.region,
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        });

        this.s3 = new AWS.S3();
        this.config = config;
    }

    public createUploadStream(key: string): S3UploadStream {
        const pass = new stream.PassThrough();

        return {
            writeStream: pass,
            promise: this.s3.upload({
                Bucket: process.env.AWS_S3_BUCKET_NAME!,
                Key: key,
                Body: pass
            })
            .promise()
        };
    }
}