import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('inventory')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thống kê số lượng sản phẩm tồn kho' })
  @ApiResponse({ status: 200, description: 'Thống kê tồn kho thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async getInventoryStats() {
    return this.statisticsService.getInventoryStats();
  }

  @Get('revenue')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thống kê doanh thu và lợi nhuận' })
  @ApiResponse({ status: 200, description: 'Thống kê doanh thu thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async getRevenueStats() {
    return this.statisticsService.getRevenueStats();
  }

  @Get('revenue/monthly/:year')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thống kê doanh thu theo tháng' })
  @ApiResponse({
    status: 200,
    description: 'Thống kê doanh thu theo tháng thành công',
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async getMonthlyRevenueStats(@Param('year') year: string) {
    return this.statisticsService.getMonthlyRevenueStats(parseInt(year));
  }
}
