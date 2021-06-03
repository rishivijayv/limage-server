import { Resolver, UseMiddleware, Mutation, Arg, Ctx, Query, Int, ObjectType, Field } from "type-graphql";
import { CustomContext } from "../types";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { ImageInput } from "../gql-types/input";
import { User } from "../entities/User";
import { Image } from "../entities/Image";
import { getConnection } from "typeorm";

@ObjectType()
class UploadedImageResponse {

    @Field(() => [Image])
    images: Image[];

    @Field()
    hasMore: boolean;
}


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

    @Query(() => UploadedImageResponse)
    @UseMiddleware(isAuthenticated)
    async uploadedImages(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: CustomContext
    ): Promise<UploadedImageResponse> {
        const limitCap = Math.min(9, limit);
        const hasMoreLimit = limitCap + 1;

        const qb = getConnection()
            .getRepository(Image)
            .createQueryBuilder("userimages")
            .orderBy('"createdAt"', "DESC")
            .where('"userId" = :userId', { userId: req.session.userId })

        if(cursor) {
            qb.andWhere('"createdAt" < :cursor', {
                cursor: new Date(parseInt(cursor))
            });
        }

        qb.take(hasMoreLimit);
        const images = await qb.getMany();
        const hasMore = images.length === hasMoreLimit;
        
        if(hasMore){
            images.pop();
        }
        

        console.log("Returning this to the user");
        console.log(images);

        return {
            images,
            hasMore
        };
    }
}