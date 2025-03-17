import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { Property, PropertyApprovalType } from './../typeorm/entities/Property';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreatePropertyDto } from './dto/CreatePropertyDto';
import { State } from './../typeorm/entities/State';
import { LGA } from './../typeorm/entities/LGA';
import { MediaService } from './../media/media.service';
import { CreateProperty } from './types/CreateProperty';
import { PropertyBooked } from './../typeorm/entities/PropertyBooked';
import { User, UserRole } from 'src/typeorm/entities/User';
import { UpdatePropertyDto } from './dto/UpdatePropertyDto';
import { Media } from 'src/typeorm/entities/Media';

interface GetPropertiesFilter {
  page: number;
  limit: number;
  type?: string;
  stateId?: string;
  lgaId?: string;
  available?: string;
}

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(LGA)
    private lgaRepository: Repository<LGA>,
    @InjectRepository(State)
    private stateRepository: Repository<State>,
    private mediaService: MediaService,
    @InjectRepository(PropertyBooked)
    private propertyBookedRepo: Repository<PropertyBooked>,
    private dataSource: DataSource,
  ) {}

  /** 🔹 Approve or Reject a Property */
  async approveProperty(id: string, status: PropertyApprovalType) {
    const property = await this.propertyRepo.findOne({ where: { id } });

    if (!property) throw new NotFoundException('Property not found');

    property.approval = status;
    if (status === PropertyApprovalType.APPROVED) {
      property.approvedAt = new Date();
    }

    return this.propertyRepo.save(property);
  }

  /** 🔹 Soft Delete Property */
  async softDeleteProperty(id: string, user: User) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!property) throw new NotFoundException('Property not found');

    // Check if user is owner or admin
    if (property.owner.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not allowed to delete this property',
      );
    }

    property.deletedAt = new Date(); // Soft delete
    return this.propertyRepo.save(property);
  }

  /** 🔹 Update Property */
  async updateProperty(
    id: string,
    updateDto: UpdatePropertyDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['owner', 'media'],
    });

    if (!property) throw new NotFoundException('Property not found');

    // Check if user is owner or admin
    if (property.owner.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not allowed to update this property',
      );
    }

    // Update fields
    if (updateDto.title) property.title = updateDto.title;
    if (updateDto.description) property.description = updateDto.description;

    // Remove media files if specified
    if (updateDto.removeMediaIds && updateDto.removeMediaIds.length > 0) {
      property.media = property.media.filter(
        (m) => !updateDto.removeMediaIds?.includes(m.id),
      );
    }

    if (files.length > 0) {
      // Add new media files if uploaded
      const arrayOfMedia = await this.mediaService.uploadMedia(
        { privacy_type: 'public', recipient_type: 'app' },
        files,
        property.id,
        property,
        //queryRunner,
      );

      property.media = [...property.media, ...arrayOfMedia];
      property.header = property.media[0];
    }

    const rup = await this.propertyRepo.save(property);

    return rup;
  }

  async getPropertyById(id: string, user: User) {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['owner', 'state', 'lga', 'media', 'header'],
    });

    if (!property) throw new NotFoundException('Property not found');

    if (
      !property.approvedAt &&
      (property.owner.id !== user.id || user.role !== UserRole.ADMIN)
    ) {
      throw new ForbiddenException(
        'You are not allowed to update this property',
      );
    }
    // Check if the property is available today
    const today = new Date().toISOString().split('T')[0]; // Get today's date (YYYY-MM-DD)
    const isBooked = await this.propertyBookedRepo.findOne({
      where: { property, date: today },
    });

    return {
      id: property.id,
      title: property.title,
      owner: `${property.owner.firstName} ${property.owner.lastName}`,
      type: property.type,
      description: property.description,
      location: property.location,
      lga: property.lga.name,
      state: property.state.name,
      media: property.media.map((m) => {
        return { id: m.id, url: m.file_url };
      }),
      header: property.header?.file_url || null,
      isAvailableToday: !isBooked, // True if not booked today
      approval: property.approval, // Pending, approved, or rejected
    };
  }

  async createLGAs(stateId: string, lgas: string[]): Promise<LGA[]> {
    const state = await this.stateRepository.findOne({
      where: { id: stateId },
    });
    if (!state) throw new BadRequestException('Invalid State ID');

    const existingLGAs = await this.lgaRepository.find();
    const existingAliases = new Set(existingLGAs.map((lga) => lga.alias));

    const newLGAs = lgas.map((lgaName) => {
      let alias = lgaName.toLowerCase().replace(/\s+/g, '_');

      // Check if alias already exists, append state alias if needed
      if (existingAliases.has(alias)) {
        alias = `${alias}_${state.alias}`;
      }

      existingAliases.add(alias); // Ensure uniqueness
      return { name: lgaName, alias, state };
    });

    return this.lgaRepository.save(newLGAs);
  }

  async getProperties(filters: GetPropertiesFilter) {
    const { type, stateId, lgaId, available, page = 1, limit = 10 } = filters;
    const query = this.propertyRepo.createQueryBuilder('property');

    // Apply filters
    if (type) {
      query.andWhere('property.type = :type', { type });
    }
    if (stateId && !lgaId) {
      query.andWhere('property.stateId = :stateId', { stateId });
    }
    if (lgaId) {
      query.andWhere('property.lgaId = :lgaId', { lgaId });
    }

    query.andWhere('property.approval = :approvalEnum', {
      approvalEnum: PropertyApprovalType.APPROVED,
    });
    // Join with header to fetch `file_url` instead of just the ID
    query.leftJoinAndSelect('property.header', 'header');

    // Execute base query to get properties before availability check
    let properties = await query.getMany();

    // If `available` is defined, exclude properties that are booked on that date
    if (available) {
      const bookedProperties = await this.propertyBookedRepo.find({
        where: { date: available },
        relations: ['property'],
      });

      const bookedPropertyIds = bookedProperties.map(
        (booking) => booking.property.id,
      );
      properties = properties.filter(
        (property) => !bookedPropertyIds.includes(property.id),
      );
    }

    // Pagination
    const total = properties.length;
    const paginatedProperties = properties
      .slice((page - 1) * limit, page * limit)
      .map(({ media, header, ...rest }) => ({
        ...rest,
        header: header?.file_url, // Replace header ID with its URL
      }));

    return {
      total,
      page,
      limit,
      data: paginatedProperties,
    };
  }

  async getLGAsByState(stateId: string): Promise<LGA[]> {
    return this.lgaRepository.find({ where: { state: { id: stateId } } });
  }

  async createStates(states: { name: string; alias: string }[]) {
    return this.stateRepository.save(states);
  }

  async getAllStates(): Promise<State[]> {
    return this.stateRepository.find({ relations: ['lgas'] });
  }

  async createProperty(
    dto: CreatePropertyDto,
    files: Express.Multer.File[],
    user: User,
  ) {
    const { lga } = dto;

    // Check if LGA exists and belongs to the given state
    const lgaExists = await this.lgaRepository.findOne({
      where: { id: lga },
      relations: ['state'],
    });
    if (!lgaExists) {
      throw new BadRequestException(
        'Invalid LGA ID or LGA does not belong to the state',
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const property = queryRunner.manager.create(Property, {
        ...dto,
        lga: lgaExists,
        state: lgaExists.state,
        approval: PropertyApprovalType.PENDING,
        owner: user,
      });

      const savedProperty = await queryRunner.manager.save(Property, property);

      const arrayOfMedia = await this.mediaService.uploadMedia(
        { privacy_type: 'public', recipient_type: 'app' },
        files,
        savedProperty.id,
        savedProperty,
        queryRunner,
      );

      savedProperty.header = arrayOfMedia[0]; // First media file as header

      console.log('about to update');
      const cp = await queryRunner.manager.save(Property, property);
      await queryRunner.commitTransaction();
      console.log(cp);
      console.log('created p');
      return cp;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return new HttpException(error, 500);
    } finally {
      await queryRunner.release();
    }
  }
}
