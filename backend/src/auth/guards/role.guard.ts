// backend/src/auth/guards/role.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true; // Nếu không có yêu cầu vai trò, cho phép truy cập
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy thông tin user từ token (được thêm bởi JwtAuthGuard)

    if (!user || !user.role) {
      throw new ForbiddenException('Không có thông tin vai trò');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này'
      );
    }

    return true;
  }
}
