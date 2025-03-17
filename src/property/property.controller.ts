import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Put,
  UseGuards,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/CreatePropertyDto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { PropertyType } from './../typeorm/entities/Property';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User, UserRole } from 'src/typeorm/entities/User';
import { UpdatePropertyDto } from './dto/UpdatePropertyDto';
import { Request } from 'express';
import { MediaService } from 'src/media/media.service';
import { PropertyApprovalDto } from './dto/PropertyApprovalDto';

@Controller('property')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly mediaService: MediaService,
  ) {}

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard) // Ensures only authenticated users can approve/reject
  async approveProperty(
    @Param('id') id: string,
    @Body() approvalDto: PropertyApprovalDto,
    @Req() req: Request,
  ) {
    if ((req.user as User).role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only admins can approve or reject properties.',
      );
    }

    return this.propertyService.approveProperty(id, approvalDto.status);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getProperty(@Param('id') id: string, @Req() req: Request) {
    return await this.propertyService.getPropertyById(id, req.user as User);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  @UseGuards(JwtAuthGuard)
  async updateProperty(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    console.log(req.user);
    const returnedProperty = await this.propertyService.updateProperty(
      id,
      updateDto,
      req.user as User,
      files,
    );
    const { createdAt, deletedAt, owner, ...rest } = returnedProperty;
    if (updateDto.removeMediaIds && updateDto.removeMediaIds.length > 0) {
      void this.mediaService.deleteMedia(updateDto.removeMediaIds);
    }

    return rest;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProperty(@Param('id') id: string, @Req() req: Request) {
    return this.propertyService.softDeleteProperty(id, req.user as User);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreatePropertyDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    console.log('in the controller');

    if (files.length < 1) {
      throw new BadRequestException(
        'you need to have at least one image uploaded',
      );
    }

    console.log('no error');
    return this.propertyService.createProperty(dto, files, req.user as User);
  }

  @Get()
  async getProperties(
    @Query('type') type?: PropertyType,
    @Query('state') stateId?: string,
    @Query('lga') lgaId?: string,
    @Query('available') available?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.propertyService.getProperties({
      type,
      stateId,
      lgaId,
      available,
      page,
      limit,
    });
  }

  @Get('states')
  async getAllStates() {
    return await this.propertyService.getAllStates();
  }

  @Get('states/:stateId')
  async getLGAsByState(@Param('stateId') stateId: string) {
    return await this.propertyService.getLGAsByState(stateId);
  }
}
