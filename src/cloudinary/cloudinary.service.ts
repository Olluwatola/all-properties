import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';
import { cloudinary } from './cloudinary/cloudinary.provider'; // Assuming you have a Cloudinary config file

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {}

  deleteFile(publicId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      void cloudinary.uploader.destroy(
        publicId,
        (error: UploadApiErrorResponse | undefined, result: any) => {
          if (error) {
            console.error(
              `Error deleting file ${publicId} from Cloudinary`,
              error,
            );
            return reject(error);
          }
          if (result.result !== 'ok') {
            console.warn(
              `Cloudinary did not confirm deletion for ${publicId}`,
              result,
            );
          }
          resolve();
        },
      );
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options: Record<string, any> = {},
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadMediaToCloudinary(
    category:
      | 'organizationLogo'
      | 'organizationLogoThumbnail'
      | 'event'
      | 'eventThumbnail'
      | 'accommodation'
      | 'accommodationThumbnail'
      | 'BCMmedia',
    userIdOrEntity: string,
    files: Express.Multer.File[],
    entityType: 'userFiles' | 'communityFiles' | 'eventFiles',
    isPrivate = false,
  ): Promise<string[]> {
    const productName = this.configService.get<string>('PRODUCT_NAME');

    const uploadPromises = files.map(async (file) => {
      let safePublicId = userIdOrEntity;

      if (category === 'event') {
        safePublicId = `${userIdOrEntity}_${file.originalname}_${Date.now()}`;
      }

      const resourceType = file.mimetype.startsWith('video/')
        ? 'video'
        : 'image';

      const uploadOptions = {
        folder: `${productName}/${entityType}/${userIdOrEntity.trim()}/${category.trim()}`,
        public_id: safePublicId,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: resourceType,
        type: isPrivate ? 'authenticated' : 'upload',
      };

      if (category === 'organizationLogoThumbnail') {
        uploadOptions['transformation'] = [{ height: 150 }];
      } else if (
        ['eventThumbnail', 'accommodationThumbnail'].includes(category)
      ) {
        uploadOptions['transformation'] = [{ height: 750, crop: 'scale' }];
      }

      const result = await this.uploadFile(file, uploadOptions);
      return result.secure_url;
    });

    return await Promise.all(uploadPromises);
  }

  generatePrivateMediaLink(
    publicId: string,
    resourceType: 'image' | 'video' = 'image',
    expiryInSeconds = 3600,
  ): string {
    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      resource_type: resourceType,
      expires_at: Math.floor(Date.now() / 1000) + expiryInSeconds,
    });

    return signedUrl;
  }
}
