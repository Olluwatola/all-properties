import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/createMediaDto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // Allow multiple files (max 10)
  async uploadMedia(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createMediaDto: CreateMediaDto,
  ) {
    console.log(files);
    const returnArr = await this.mediaService.uploadMedia(
      createMediaDto,
      files,
      'test-upload',
    );
    console.log(returnArr);
    return returnArr;
  }
  @Get(':id')
  async getMedia(@Param('id') id: string) {
    return this.mediaService.getMediaById(id);
  }
}
