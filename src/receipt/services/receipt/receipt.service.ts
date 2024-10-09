import { Injectable } from '@nestjs/common';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
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
    let browser;
    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: true, // Run headless mode
        defaultViewport: chromium.defaultViewport,
      });
    } catch (error) {
      console.error('Error launching browser:', error);
      throw new Error('Failed to launch browser.');
    }

    const page = await browser.newPage();
    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });

    // Generate the PDF (which returns a Uint8Array)
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    // Convert Uint8Array to Buffer
    const pdfBuffer = Buffer.from(pdfUint8Array);

    await browser.close();
    return pdfBuffer;
  }
}
