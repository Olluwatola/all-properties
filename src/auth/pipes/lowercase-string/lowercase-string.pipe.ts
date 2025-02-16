import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class LowercaseStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        `Expected a string but got ${typeof value} for field:${metadata.data}`,
      );
    }
    return value.toLowerCase();
  }
}
