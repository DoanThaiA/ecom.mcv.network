import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { NhanhLocationService } from '../../nhanh/services/nhanh-location.service';
import { LocationListResponseDto } from './dto/shipping.dto';

/**
 * Public shipping controller for location endpoints
 * No authentication required - used by shopping client for address selection
 */
@ApiTags('Shop - Shipping')
@Controller({ path: 'shop/shipping', version: '1' })
export class ShippingController {
  constructor(private readonly locationService: NhanhLocationService) {}

  /**
   * Get all cities for address selection dropdown
   */
  @Get('locations/cities')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all cities',
    description:
      'Returns all cities for shipping address selection. Data is cached for 24 hours.',
  })
  @ApiOkResponse({
    description: 'Cities returned successfully',
    type: LocationListResponseDto,
  })
  async getCities(): Promise<LocationListResponseDto> {
    const cities = await this.locationService.getCities();
    return {
      data: cities.map((city) => ({
        id: city.id,
        name: city.name,
        otherName: city.otherName,
      })),
    };
  }

  /**
   * Get districts for a city
   */
  @Get('locations/districts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get districts for a city',
    description:
      'Returns districts for the specified city. Data is cached for 24 hours.',
  })
  @ApiQuery({
    name: 'cityId',
    type: Number,
    required: true,
    description: 'City ID to get districts for',
    example: 79,
  })
  @ApiOkResponse({
    description: 'Districts returned successfully',
    type: LocationListResponseDto,
  })
  async getDistricts(
    @Query('cityId', ParseIntPipe) cityId: number,
  ): Promise<LocationListResponseDto> {
    const districts = await this.locationService.getDistricts(cityId);
    return {
      data: districts.map((district) => ({
        id: district.id,
        name: district.name,
        otherName: district.otherName,
      })),
    };
  }

  /**
   * Get wards for a district
   */
  @Get('locations/wards')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get wards for a district',
    description:
      'Returns wards for the specified district. Data is cached for 24 hours.',
  })
  @ApiQuery({
    name: 'districtId',
    type: Number,
    required: true,
    description: 'District ID to get wards for',
    example: 769,
  })
  @ApiOkResponse({
    description: 'Wards returned successfully',
    type: LocationListResponseDto,
  })
  async getWards(
    @Query('districtId', ParseIntPipe) districtId: number,
  ): Promise<LocationListResponseDto> {
    const wards = await this.locationService.getWards(districtId);
    return {
      data: wards.map((ward) => ({
        id: ward.id,
        name: ward.name,
        otherName: ward.otherName,
      })),
    };
  }
}
