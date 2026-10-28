import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address } from './domain/address';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'addresses', version: '1' })
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  @ApiOkResponse({ description: 'List of addresses', type: [Address] })
  async findAll(@Request() req): Promise<Address[]> {
    return this.addressesService.findByUserId(req.user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address for current user' })
  @ApiOkResponse({ description: 'Default address', type: Address })
  async findDefault(@Request() req): Promise<Address | null> {
    return this.addressesService.findDefaultByUserId(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiCreatedResponse({ description: 'Address created', type: Address })
  async create(
    @Request() req,
    @Body() createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiOkResponse({ description: 'Address updated', type: Address })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    return this.addressesService.update(req.user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an address' })
  @ApiNoContentResponse({ description: 'Address deleted' })
  async remove(@Request() req, @Param('id') id: string): Promise<void> {
    return this.addressesService.remove(req.user.id, id);
  }

  @Put(':id/set-default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiOkResponse({ description: 'Address set as default', type: Address })
  async setDefault(@Request() req, @Param('id') id: string): Promise<Address> {
    return this.addressesService.setDefault(req.user.id, id);
  }
}
