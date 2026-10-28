import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnRequestDto } from './dto/create-return-request.dto';
import { QueryReturnRequestDto } from './dto/query-return-request.dto';
import { ReturnRequest } from './domain/return-request';
import { ShopAuthGuard, ShopCustomer } from '../shop/guards/shop-auth.guard';
import { Customer } from '../shop/decorators/shop-customer.decorator';

/**
 * Shop controller for customer return requests
 */
@ApiTags('Shop - Returns')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-session-id',
  description: 'Session ID for guest identification',
  required: false,
})
@UseGuards(ShopAuthGuard)
@Controller({ path: 'shop/return-requests', version: '1' })
export class ShopReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  /**
   * Create a new return request
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create return request' })
  @ApiResponse({ status: 201, type: ReturnRequest })
  async createReturnRequest(
    @Customer() customer: ShopCustomer,
    @Body() dto: CreateReturnRequestDto,
  ): Promise<ReturnRequest> {
    if (!customer.userId) {
      throw new Error('User must be authenticated to create return request');
    }
    return this.returnsService.createReturnRequest(customer.userId, dto);
  }

  /**
   * Get my return requests
   */
  @Get()
  @ApiOperation({ summary: 'Get my return requests' })
  @ApiResponse({ status: 200, type: [ReturnRequest] })
  async getMyReturnRequests(
    @Customer() customer: ShopCustomer,
    @Query() query: QueryReturnRequestDto,
  ) {
    if (!customer.userId) {
      throw new Error('User must be authenticated to view return requests');
    }
    return this.returnsService.getMyReturnRequests(customer.userId, query);
  }
}
