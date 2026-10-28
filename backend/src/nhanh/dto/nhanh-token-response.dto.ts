export class NhanhTokenResponseDto {
  code: number;
  data?: {
    accessToken: string;
    version: string;
    expiredAt: number;
    businessId: number;
    depotIds: number[];
    pageIds: number[];
    permissions: string[];
  };
  messages?: {
    [key: string]: string[];
  };
}
