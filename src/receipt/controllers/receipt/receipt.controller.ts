import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateReceiptDto } from '../../dtos/requests/create-receipt.dto';
import { ReceiptService } from '../../services/receipt/receipt.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from '../../../user/securities/permissions.security';
import { Permissions } from '../../../user/decorators';

@ApiBearerAuth()
@ApiTags('receipt')
@Controller('receipt')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Permissions('receipt::write')
  @UseGuards(PermissionGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() createReceiptDto: CreateReceiptDto,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    const pdfBuffer = await this.receiptService.create(
      createReceiptDto,
      baseUrl,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${createReceiptDto.shopName}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
  @Get()
  @Render('receipt-template')
  root() {
    return {
      shopName: 'Awesome Shop',
      shopAddress: '123 Main Street, City, Country',
      shopPhone: '+1 (555) 123-4567',
      items: [
        {
          description: 'Item 1',
          price: 19,
        },
        {
          description: 'Item 2',
          price: 25,
        },
      ],
      total: 45.0,
      cash: 50,
      change: 4,
      bankCardLast4Digits: '1234',
      approvalCode: 'A1234567890',
      message: 'Thank you for shopping with us!',
    };
  }
}
