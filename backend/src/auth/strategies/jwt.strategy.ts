// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    const blacklistedToken = await this.prisma.blacklistToken.findUnique({
      where: { token },
    });

    if (blacklistedToken) {
      const now = new Date();
      if (blacklistedToken.expiresAt < now) {
        await this.prisma.blacklistToken.delete({
          where: { token },
        });
      } else {
        throw new UnauthorizedException(
          'Token đã bị vô hiệu hóa. Vui lòng đăng nhập lại.'
        );
      }
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
