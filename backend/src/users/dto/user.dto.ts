import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsValidId } from '../../utils/decorators/is-valid-id.decorator';

export class UserDto {
  @ApiProperty({
    type: String,
    example: 'userId',
  })
  @IsNotEmpty()
  @IsValidId({ message: i18nValidationMessage('validation.isValidId') })
  id: string | number;
}
