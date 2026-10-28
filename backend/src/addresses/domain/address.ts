export class Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  street: string;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  wardId: number;
  wardName: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
