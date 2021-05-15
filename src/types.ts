import { Request, Response } from "express";

export type CustomContext = {
    req: Request,
    res: Response
}