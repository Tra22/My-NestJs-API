import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from '../../dtos/requests/create-receipt.dto';
import * as hbs from 'handlebars';
import { join } from 'path';
import { readFileSync } from 'fs';
import { chromium } from '@playwright/test'; // Using Playwright

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

    // Read the Handlebars template from the file
    const templateFile = readFileSync(templatePath, 'utf-8');
    const template = hbs.compile(templateFile);

    // Render the HTML content using the HBS template
    const htmlContent = template({ ...createReceiptDto, baseUrl });

    // Set up Playwright with Chromium (without the need for any external browser)
    const browser = await chromium.launch({
      headless: true, // Always true in serverless environments
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // To avoid permission issues
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.addStyleTag({ url: `${baseUrl}/styles/tailwind.css` });

    // Generate the PDF from the rendered page
    const pdfBuffer: Buffer = await page.pdf({ format: 'A6' });
    await browser.close();

    return pdfBuffer;
  }
}
