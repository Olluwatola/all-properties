import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './../../utils/types';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    const secretOrKey = configService.get<string>('JWT_SECRET');
    if (!secretOrKey) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload) {
    console.log(payload);
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
      select: ['id', 'role', 'kycStatus', 'profilePicture'], // Fetch only required fields
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
