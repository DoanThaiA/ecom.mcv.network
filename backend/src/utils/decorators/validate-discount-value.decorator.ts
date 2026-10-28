import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { DiscountType } from '../../combos/domain/discount-type.enum';

/**
 * Validates that discountValue is within a valid range when discountType is percentage.
 * Rejects negative values and values exceeding the maximum.
 * Use on fields named `discountValue` where a sibling `discountType` field exists.
 * @param max Maximum allowed percentage value (default: 100)
 * @param validationOptions Optional class-validator options
 */
export function ValidateDiscountValue(
  max = 100,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateDiscountValue',
      target: object.constructor,
      propertyName,
      constraints: [max],
      options: {
        message: `Percentage discount must be between 0 and ${max}`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const discountType = obj['discountType'];
          if (discountType !== DiscountType.PERCENTAGE) {
            return true;
          }
          if (typeof value !== 'number') {
            return true;
          }
          return value >= 0 && value <= args.constraints[0];
        },
      },
    });
  };
}
