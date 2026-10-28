import type { File as FileType } from '@/types/gen/shared/shared/files/file';
import type {
  ReturnRequestType,
  ExchangeReason,
  ReturnReason,
} from '@/types/returnRequest';

export interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}

export interface FormData {
  requestType: ReturnRequestType | null;
  exchangeReasons: ExchangeReason[];
  returnReasons: ReturnReason[];
  otherReason: string;
  productToExchange: string;
  productWanted: string;
  orderId: string;
  images: FileType[];
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface TouchedFields {
  requestType: boolean;
  exchangeReasons: boolean;
  returnReasons: boolean;
  otherReason: boolean;
  productToExchange: boolean;
  productWanted: boolean;
  orderId: boolean;
  images: boolean;
  bankName: boolean;
  accountNumber: boolean;
  accountHolder: boolean;
}

export const initialFormData: FormData = {
  requestType: null,
  exchangeReasons: [],
  returnReasons: [],
  otherReason: '',
  productToExchange: '',
  productWanted: '',
  orderId: '',
  images: [],
  bankName: '',
  accountNumber: '',
  accountHolder: '',
};

export const initialTouched: TouchedFields = {
  requestType: false,
  exchangeReasons: false,
  returnReasons: false,
  otherReason: false,
  productToExchange: false,
  productWanted: false,
  orderId: false,
  images: false,
  bankName: false,
  accountNumber: false,
  accountHolder: false,
};

export const VIETNAM_BANKS = [
  'Vietcombank',
  'Techcombank',
  'BIDV',
  'Agribank',
  'VPBank',
  'MB Bank',
  'ACB',
  'Sacombank',
  'TPBank',
  'VIB',
  'HDBank',
  'OCB',
  'SHB',
  'MSB',
  'SeABank',
  'Eximbank',
  'LienVietPostBank',
  'VietCapitalBank',
  'ABBank',
  'NCB',
];

export const EXCHANGE_REASONS: ExchangeReason[] = ['size', 'color', 'model', 'other'];
export const RETURN_REASONS: ReturnReason[] = ['wrongItem', 'notAsDescribed', 'notSatisfied', 'other'];
