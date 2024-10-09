import { Injectable } from '@nestjs/common';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';
import * as puppeteer from 'puppeteer';
import chromium from 'chrome-aws-lambda';

@Injectable()
export class ReceiptService {
  async create(createReceiptDto, baseUrl: string): Promise<Buffer> {
    // Compile Handlebars template
    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'views',
      'receipt-template.hbs',
    );
    const templateFile = fs.readFileSync(templatePath, 'utf-8');
    const template = hbs.compile(templateFile);
    const renderedHtml = template({ ...createReceiptDto, baseUrl });

    // Use puppeteer-core with chrome-aws-lambda in production
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true, // Run headless mode
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'a6',
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
