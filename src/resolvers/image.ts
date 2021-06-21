import { Resolver, UseMiddleware, Mutation, Arg, Ctx, Query, Int, ObjectType, Field } from "type-graphql";
import { CustomContext, GenericObject } from "../types";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { ImageInput, ImageSaveInput, DeleteLabelImageInput, PaginatedInput } from "../gql-types/input";
import { User } from "../entities/User";
import { Image } from "../entities/Image";
import { UserLabel } from "../entities/UserLabel";
import { LabelImage } from "../entities/LabelImage";
import { getConnection, EntityTarget, SelectQueryBuilder } from "typeorm";
import GenerateGqlPaginatedResponse from "../gql-types/pagination";

@ObjectType()
class SaveImageResponse {
    @Field()
    saveSuccessful: boolean;

    @Field()
    descrtiption: string;
}

@ObjectType()
class DeleteLabelImageResponse {
    @Field()
    deleteSuccessful: boolean

    @Field(() => Int)
    imagesLeftInLabel?: number
}

class PaginatedResponse<T> {
    entities: T[]
    hasMore: boolean
}

const PaginatedImageResponse = GenerateGqlPaginatedResponse(Image, "Image");
type PaginatedImageResponse = InstanceType<typeof PaginatedImageResponse>;

const PaginatedUserLabelResponse = GenerateGqlPaginatedResponse(UserLabel, "UserLabel");
type PaginatedUserLabelResponse = InstanceType<typeof PaginatedUserLabelResponse>;

function paginatedQueryBuilder<T>(repoName: EntityTarget<T>, condition: string, conditionParameter: GenericObject, limit: number, cursor: string | null): SelectQueryBuilder<T> {
    const qb = getConnection()
        .getRepository(repoName)
        .createQueryBuilder()
        .where(condition, conditionParameter)

    if (cursor) {
        qb.andWhere('"createdAt" < :cursor', {
            cursor: new Date(parseInt(cursor))
        });
    }
    qb.orderBy('"createdAt"', "DESC").take(limit);

    return qb;

}

async function paginatedQueryResponse<T>(repoName: EntityTarget<T>, condition: string, conditionParameter: GenericObject, limit: number, cursor: string | null): Promise<PaginatedResponse<T>> {
    const limitCap = Math.min(9, limit);
    const hasMoreLimit = limitCap + 1;

    const query = paginatedQueryBuilder(repoName, condition, conditionParameter, hasMoreLimit, cursor);
    const entities = await query.getMany();
    const hasMore = entities.length === hasMoreLimit
    
    if(hasMore){
        entities.pop()
    }

    return {
        entities,
        hasMore
    }

    

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

    @Mutation(() => DeleteLabelImageResponse)
    @UseMiddleware(isAuthenticated)
    async deleteSavedImage(
        @Arg('imageInfo') { imageId, labelId }: DeleteLabelImageInput
    ): Promise<DeleteLabelImageResponse> {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        await queryRunner.startTransaction();

        try {
            // Delete current image in current label
            await queryRunner.query(`DELETE FROM "label_image" WHERE "userLabelId" = ${labelId} AND "imageId" = ${imageId}`);

            // Check if any more images left in label
            const imagesInLabel = await queryRunner.manager.getRepository(LabelImage)
                .createQueryBuilder()
                .where('"userLabelId" = :labelid', {labelid: labelId})
                .getMany();
            
            // If no more images in the label, delete the label and notify client
            if(imagesInLabel.length === 0){
                await queryRunner.query(`DELETE FROM "user_label" WHERE id = ${labelId}`);
            }

            queryRunner.commitTransaction();

            return {
                deleteSuccessful: true,
                imagesLeftInLabel: imagesInLabel.length
            }


        }catch(err){
            queryRunner.rollbackTransaction();
            return {
                deleteSuccessful: false
            }
        }finally {
            queryRunner.release();
        }
    }

    @Mutation(() => SaveImageResponse)
    @UseMiddleware(isAuthenticated)
    async saveImage(
        @Arg('imageInfo') { imageId, labelName }: ImageSaveInput,
        @Ctx() { req }: CustomContext
    ): Promise<SaveImageResponse> {

        const userId = req.session.userId!;
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();

        try {

            // Check if user already has images for this label
            const userLabel = await queryRunner.manager.getRepository(UserLabel)
                .createQueryBuilder()
                .where(`"labelName" = :name`, { name: labelName })
                .andWhere('"userId" = :userId', { userId: userId })
                .getOne();

            console.log("This is stuff", userLabel);

            let labelId = userLabel?.id;

            if(labelId === undefined){
                // Retrieve the user
                const user = await queryRunner.manager.findOne(User, {
                    where: { id: userId }
                });

                // Create the label
                const labelInsertResult = await queryRunner.manager.createQueryBuilder()
                    .insert()
                    .into(UserLabel)
                    .values([
                        { labelName: labelName, user: user }
                    ])
                    .returning("id")
                    .execute();
                
                labelId = labelInsertResult.identifiers[0].id as number;
            }


            // Check if image already saved in label
            const imageInLabel = await queryRunner.manager.getRepository(LabelImage)
                .createQueryBuilder()
                .where('"userLabelId" = :labelid', { labelid: labelId })
                .andWhere('"imageId" = :imageid', { imageid: imageId })
                .getOne();

            if (imageInLabel) {
                return {
                    saveSuccessful: false,
                    descrtiption: "You have already saved this image"
                };
            }

            // Save the image in the LabelImage relation
            await queryRunner.query(`INSERT INTO "label_image" ("userLabelId", "imageId") VALUES (${labelId!}, ${imageId})`);

            await queryRunner.commitTransaction();

            return {
                saveSuccessful: true,
                descrtiption: "Image successfully saved"
            }


        }catch(error) {
            await queryRunner.rollbackTransaction();
            return {
                saveSuccessful: false,
                descrtiption: "Something went wrong. Please try again later."
            };
        } finally {
            await queryRunner.release();
        }
    }

    @Query(() => PaginatedImageResponse)
    @UseMiddleware(isAuthenticated)
    async uploadedImages(
        @Arg('paginatedInput') { limit, cursor }: PaginatedInput,
        @Ctx() { req }: CustomContext
    ): Promise<PaginatedResponse<Image>> {
        const paginatedImages = await paginatedQueryResponse<Image>(Image, '"userId" = :userId', { userId: req.session.userId }, limit, cursor);
        return paginatedImages;
    }

    @Query(() => PaginatedUserLabelResponse)
    @UseMiddleware(isAuthenticated)
    async labelsForUser(
        @Arg('paginatedInput') { limit, cursor }: PaginatedInput,
        @Ctx() { req }: CustomContext
    ): Promise<PaginatedResponse<UserLabel>> {
        const paginatedUserLabels = await paginatedQueryResponse<UserLabel>(UserLabel, '"userId" = :userId', { userId: req.session.userId }, limit, cursor);
        return paginatedUserLabels;
    }

    @Query(() => PaginatedImageResponse)
    @UseMiddleware(isAuthenticated)
    async savedImages(
        @Arg('paginatedInput') { limit, cursor }: PaginatedInput,
        @Arg('labelId', () => Int) labelId: number
    ): Promise<PaginatedResponse<Image>> {
        const { entities: savedImages, hasMore } = await paginatedQueryResponse<LabelImage>(LabelImage, '"userLabelId" = :labelId', { labelId }, limit, cursor);

        // Retrieve the images from the images IDs
        const imagesToReturn = await getConnection().getRepository(Image)
            .createQueryBuilder("image")
            .where("id IN (:...ids)", { ids: savedImages.map(savedImage => savedImage.imageId) })
            .getMany();
        
        return {
            entities: imagesToReturn,
            hasMore
        }
    }

    @Query(() => PaginatedImageResponse)
    async discoverImages(
        @Arg('paginatedInput') { limit, cursor }: PaginatedInput,
        @Arg("search") search: string 
    ): Promise<PaginatedResponse<Image>> {
        const imagesToDiscover = await paginatedQueryResponse(Image, "label LIKE :labelPattern", { labelPattern: `%${search}%` }, limit, cursor);
        return imagesToDiscover;

    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async deleteUploadedImage(
        @Arg("imageId", () => Int) imageId: number,
        @Ctx() { uploader }: CustomContext
    ): Promise<Boolean> {
        const image = await Image.findOne({
            where: { id: imageId }
        });
        if(!image) return false;

        const imageKey = image.location.substring(image.location.lastIndexOf('/') + 1);
        const deleteImage = uploader.deleteImageByKey(imageKey);
        
        try {
            await deleteImage.promise;
            // Delete from DB
            await Image.delete({ id: imageId });
            return true;
        }catch(_){
            return false;
        }        
         
    }
}