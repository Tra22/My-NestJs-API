import { CreateItemDto } from './create-items.dto';

export class ReceiptDto {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  items: CreateItemDto[];
  total: number;
  cash: number;
  change: number;
  bankCardLast4Digits?: string;
  approvalCode?: string;
  message?: string;
}
