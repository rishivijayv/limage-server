import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Stream } from "stream";
import { Uploader } from "./utilities/uploader"

export type S3UploadConfig = {
    accessKeyId: string;
    secretAccessKey: string;
    destinationBucketName: string;
    region: string
}

export type CustomContext = {
    req: Request & { session: Session & Partial<SessionData> & { userId?: number } },
    res: Response,
    uploader: Uploader
}

export type Upload = {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}
