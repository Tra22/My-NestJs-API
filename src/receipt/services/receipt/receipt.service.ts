import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from '../../dtos/requests/create-receipt.dto';
import * as hbs from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';
import puppeteer from 'puppeteer';

@Injectable()
export class ReceiptService {
  async create(
    createReceiptDto: CreateReceiptDto,
    baseUrl: string,
  ): Promise<Buffer> {
    const isDevelopment = process.env.NODE_ENV === 'production';
    const templatePath = isDevelopment
      ? join(
          __dirname,
          '..',
          '..',
          '..',
          '..',
          'dist',
          'views',
          'receipt-template.hbs',
        )
      : join(__dirname, '..', '..', '..', 'views', 'receipt-template.hbs');

    // // Read the Handlebars template from the file
    // const templatePath = join(__dirname, '..', 'views', 'receipt-template.hbs');
    const templateFile = readFileSync(templatePath, 'utf-8');
    const template = hbs.compile(templateFile);

    // Render the HTML content using the HBS template
    const htmlContent = template({ ...createReceiptDto, baseUrl });

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true, // Ensure headless mode is enabled for server environments
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--remote-debugging-port=9222',
      ],
    });

    const page = await browser.newPage();
    await page.addStyleTag({ url: `${baseUrl}/styles/tailwind.css` });
    await page.setContent(htmlContent);

    const pdfArray: Uint8Array = await page.pdf({ format: 'A6' });
    await browser.close();

    // Convert Uint8Array to Buffer and return
    const pdfBuffer: Buffer = Buffer.from(pdfArray);

    return pdfBuffer;
  }
}
