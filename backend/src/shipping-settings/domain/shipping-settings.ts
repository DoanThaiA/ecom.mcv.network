import { ShippingCalculationMethod } from './shipping-calculation-method.enum';

export class ShippingSettings {
  id: string;
  calculationMethod: ShippingCalculationMethod;
  fixedShippingFee: number;
  updatedAt: Date;
}
