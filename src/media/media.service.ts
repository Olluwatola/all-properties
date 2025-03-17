import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, QueryRunner, Repository } from 'typeorm';
import { Media } from './../typeorm/entities/Media';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMediaDto } from './dto/createMediaDto';
import { Property } from 'src/typeorm/entities/Property';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadMedia(
    createMediaDto: CreateMediaDto,
    files: Express.Multer.File[],
    entityId: string | number,
    property?: Property,
    queryRunner?: QueryRunner,
  ) {
    const { privacy_type, recipient_type, recipient_user_id, description } =
      createMediaDto;
    console.log(files.length);
    const uploadPromises = files.map(async (file) => {
      const uploadResult = await this.cloudinaryService.uploadFile(file, {
        folder: `media/${recipient_type}/${entityId}`,
        type: privacy_type === 'private' ? 'authenticated' : 'upload',
        resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      });

      if (queryRunner) {
        const media = queryRunner.manager.create(Media, {
          privacy_type,
          recipient_type,
          recipient_user_id,
          description,
          public_id: uploadResult.public_id,
          property: property ? property : undefined,
          file_url: uploadResult.secure_url,
          file_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          file_size: file.size,
        });

        const savedMedia = await queryRunner.manager.save(Media, media);
        return savedMedia;
      } else {
        const media = this.mediaRepository.create({
          privacy_type,
          recipient_type,
          recipient_user_id,
          description,
          public_id: uploadResult.public_id,
          property: property ? property : undefined,
          file_url: uploadResult.secure_url,
          file_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
          file_size: file.size,
        });

        const savedMedia = await this.mediaRepository.save(media);
        return savedMedia;
      }
    });
    return await Promise.all(uploadPromises); // Return all uploaded media records
  }

  async deleteMedia(mediaIds: string[], queryRunner?: QueryRunner) {
    if (!mediaIds.length) {
      throw new BadRequestException('No media IDs provided for deletion');
    }

    try {
      // Fetch media records to extract public_ids
      const mediaRecords = await this.mediaRepository.findBy({
        id: In(mediaIds),
      });

      if (!mediaRecords.length) {
        throw new NotFoundException('No matching media found');
      }

      // Extract Cloudinary public_ids
      const publicIds = mediaRecords.map((media) => media.public_id);

      // Delete media records from DB first
      if (queryRunner) {
        await queryRunner.manager.delete(Media, mediaIds);
      } else {
        await this.mediaRepository.delete(mediaIds);
      }

      // Attempt to delete from Cloudinary
      const deletePromises = publicIds.map(async (publicId) => {
        try {
          await this.cloudinaryService.deleteFile(publicId);
        } catch (error) {
          console.error(
            `Failed to delete media ${publicId} from Cloudinary`,
            error,
          );
        }
      });

      await Promise.all(deletePromises);

      return {
        message: 'Media deleted successfully',
        deletedCount: mediaRecords.length,
      };
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new InternalServerErrorException('Failed to delete media');
    }
  }

  async getMediaById(id: string): Promise<string> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    if (media.privacy_type === 'private') {
      return this.cloudinaryService.generatePrivateMediaLink(
        media.public_id,
        media.file_type.startsWith('video/') ? 'video' : 'image',
      );
    }

    return media.file_url;
  }
}
