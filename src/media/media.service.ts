import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './../typeorm/entities/Media';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateMediaDto } from './dto/createMediaDto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadMedia(createMediaDto: CreateMediaDto, file: Express.Multer.File) {
    const { privacy_type, recipient_type, recipient_user_id, description } =
      createMediaDto;

    const uploadResult = await this.cloudinaryService.uploadFile(file, {
      folder: `media/${recipient_type}/${recipient_user_id}`,
      type: privacy_type === 'private' ? 'authenticated' : 'upload',
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    });

    const media = this.mediaRepository.create({
      privacy_type,
      recipient_type,
      recipient_user_id,
      description,
      public_id: uploadResult.public_id,
      file_url: uploadResult.secure_url,
      file_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      file_size: file.size,
    });

    return await this.mediaRepository.save(media);
  }

  async getMediaById(id: string, isPrivate: boolean): Promise<string> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    if (media.privacy_type === 'private' && isPrivate) {
      return this.cloudinaryService.generatePrivateMediaLink(
        media.public_id,
        media.file_type.startsWith('video/') ? 'video' : 'image',
      );
    }

    return media.file_url;
  }
}
