import {
  IsEnum,
  IsNumber,
  ValidateNested,
  IsArray,
  IsObject,
  Allow,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NhanhWebhookEvent {
  WEBHOOKS_ENABLED = 'webhooksEnabled',
  PRODUCT_ADD = 'productAdd',
  PRODUCT_UPDATE = 'productUpdate',
  PRODUCT_DELETE = 'productDelete',
  INVENTORY_CHANGE = 'inventoryChange',
  ORDER_ADD = 'orderAdd',
  ORDER_UPDATE = 'orderUpdate',
  ORDER_DELETE = 'orderDelete',
}

export interface NhanhOrderWebhookData {
  info: {
    id: number;
    depotId?: number;
    pickupDepotId?: number;
    type?: number;
    status: number;
    createdBy?: {
      id: number;
      name: string;
    };
    sale?: {
      id: number;
      name: string;
    };
    technicalStaff?: {
      id: number;
      name: string;
    };
    customerCare?: {
      id: number;
      name: string;
    };
    createdAt?: number;
    updatedAt?: number;
    confirmedAt?: number;
    packedAt?: number;
    description?: string;
    privateDescription?: string;
    trackingUrl?: string;
  };
  channel?: {
    appOrderId?: string;
    appShopId?: string;
    appShopName?: string;
    saleChannel?: number;
    trafficSource?: {
      id: number;
      name: string;
    };
    facebook?: {
      pageId?: string;
      conversationId?: string;
      adId?: string;
      postId?: string;
    };
    utmCampaign?: string;
    domain?: string;
  };
  shippingAddress?: {
    id?: string;
    name: string;
    mobile: string;
    email?: string;
    address?: string;
    cityId?: number;
    districtId?: number;
    wardId?: number;
    locationVersion?: string;
  };
  products?: Array<{
    id: number;
    typeId?: number;
    code: string;
    name: string;
    avatar?: string;
    weight?: number;
    quantity: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    available?: number;
    avgCost?: number;
    vat?: {
      value?: number;
      amount?: number;
    };
    description?: string;
    imei?: {
      id: number;
      code: string;
    };
    batch?: {
      id: number;
      name: string;
      manufactureDate?: string;
      expiredDate?: string;
    };
    combos?: Array<{
      id: number;
      name: string;
      quantity: number;
    }>;
    unit?: {
      id: number;
      name: string;
      quantity: number;
    };
    gifts?: Array<{
      id: number;
      name: string;
      quantity: number;
    }>;
  }>;
  carrier?: {
    id?: number;
    name?: string;
    orderPackageSize?: {
      height?: number;
      merge?: number;
      length?: number;
      weight?: number;
      width?: number;
    };
    service?: {
      id?: number;
      name?: string;
      code?: string;
    };
    carrierCode?: string;
    isPartDelivery?: number;
    sendCarrier?: {
      type?: number;
      date?: string;
    };
    deliveryDate?: string;
    weight?: number;
    shipFee?: number;
    codFee?: number;
    declaredFee?: number;
    returnFee?: number;
    customerShipFee?: number;
  };
  payment?: {
    couponCode?: string;
    credit?: {
      amount?: number;
      accountId?: number;
      code?: string;
    };
    deposit?: {
      amount?: number;
      accountId?: number;
    };
    discount?: {
      type?: string;
      amount?: number;
    };
    transfer?: {
      amount?: number;
      accountId?: number;
    };
    usedPoints?: {
      points?: number;
      amount?: number;
    };
    vat?: {
      type?: string;
      amount?: number;
      taxCode?: string;
      taxDate?: string;
    };
  };
}

export interface NhanhInventoryChangeItem {
  id: number;
  typeId?: number;
  code?: string;
  remain: number;
  shipping?: number;
  damaged?: number;
  holding?: number;
  transfering?: number;
  available: number;
  warranty?: {
    remain?: number;
    holding?: number;
  };
  depots?: Array<{
    id: number;
    remain: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    transfering?: number;
    available: number;
    warranty?: {
      remain?: number;
      holding?: number;
    };
  }>;
}

export interface NhanhProductWebhookData {
  id: number;
  parentId?: number;
  code: string;
  barcode?: string;
  name: string;
  otherName?: string;
  status: string | number;
  categoryId?: number;
  category?: {
    id: number;
    code?: string;
    name: string;
  };
  internalCategory?: {
    id: number;
    code?: string;
    name: string;
  };
  prices: {
    retail: number;
    import?: number;
    old?: number;
    wholesale?: number;
    avgCost?: number;
  };
  vat?: number;
  images?: {
    avatar?: string;
    others?: string[];
  };
  description?: string;
  content?: string;
  brand?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    name: string;
  };
  shipping?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };
  inventory?: {
    remain: number;
    shipping?: number;
    damaged?: number;
    holding?: number;
    transfering?: number;
    warranty?: {
      remain?: number;
      holding?: number;
    };
    holdingNew?: number;
    shippingExport?: number;
    available: number;
    depots?: Array<{
      id: number;
      remain: number;
      shipping?: number;
      damaged?: number;
      holding?: number;
      transfering?: number;
      warranty?: {
        remain?: number;
        holding?: number;
      };
      holdingNew?: number;
      shippingExport?: number;
      available: number;
    }>;
  };
  attributes?: Array<{
    id?: number | string;
    name: string;
    value: string;
  }>;
  updatedAt?: number;
  createdAt?: number;
  childs?: NhanhProductWebhookData[];
}

export class NhanhWebhookPayloadDto {
  @ApiProperty({
    enum: NhanhWebhookEvent,
    description: 'Webhook event type',
    example: NhanhWebhookEvent.PRODUCT_UPDATE,
  })
  @IsEnum(NhanhWebhookEvent)
  event: NhanhWebhookEvent;

  @ApiProperty({
    description: 'Business ID from Nhanh.vn',
    example: 123456,
  })
  @IsNumber()
  businessId: string | number;

  @ApiProperty({
    description: 'Event data - structure varies by event type',
  })
  @Allow()
  data:
    | NhanhProductWebhookData
    | number[]
    | NhanhInventoryChangeItem[]
    | NhanhOrderWebhookData
    | Record<string, any>;
}
