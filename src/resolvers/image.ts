import { Resolver, UseMiddleware, Mutation, Arg, Ctx } from "type-graphql";
import { CustomContext } from "../types";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { ImageInput } from "../gql-types/input";
import { User } from "../entities/User";
import { Image } from "../entities/Image";


@Resolver()
export default class ImageResolver {

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async upload(
        @Arg('image') { file, label }: ImageInput,
        @Ctx() { req, uploader }: CustomContext
    ): Promise<Boolean> {

        const { createReadStream, filename } = await file;

        try{
            const user = await User.findOne({
                where: { id: req.session.userId }
            });
            const s3Key = uploader.createKeyFromFilename(filename, user!.username);
            const uploadStream = uploader.createUploadStream(s3Key);
            createReadStream().pipe(uploadStream.writeStream);
            const result = await uploadStream.promise;

            // User is guaranteed to exist as they are authenticated
            await Image.create({ location: result.Location, label, user }).save();

            return result != undefined && result != null;
        }catch(error){
            return false;
        }

    }
}