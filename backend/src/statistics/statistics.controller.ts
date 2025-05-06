import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService, DailyStat } from './statistics.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('order-stats')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Thống kê đơn hàng và nhập hàng trong khoảng thời gian',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Thống kê thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async getOrderStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<{ message: string; data: DailyStat[] }> {
    return this.statisticsService.getOrderStats(startDate, endDate);
  }

  @Get('profit-daily')
  @UseGuards(RoleGuard)
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thống kê lợi nhuận trong ngày' })
  @ApiResponse({ status: 200, description: 'Thống kê thành công' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @ApiResponse({
    status: 403,
    description: 'Bạn không có quyền thực hiện hành động này',
  })
  async getDailyProfitStats(@Query('date') date?: string) {
    return this.statisticsService.getDailyProfitStats(date);
  }
}
