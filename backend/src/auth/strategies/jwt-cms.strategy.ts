import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { OrNeverType } from '../../utils/types/or-never.type';
import { JwtCmsPayloadType } from './types/jwt-cms-payload.type';
import { AllConfigType } from '../../config/config.type';
import { throwException } from '../../utils/errors/throw-exception';

@Injectable()
export class JwtCmsStrategy extends PassportStrategy(Strategy, 'jwt-cms') {
  constructor(configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('auth.secret', { infer: true }),
    });
  }

  public validate(payload: JwtCmsPayloadType): OrNeverType<JwtCmsPayloadType> {
    if (!payload.id) {
      throwException({ status: HttpStatus.UNAUTHORIZED });
    }

    return payload;
  }
}
