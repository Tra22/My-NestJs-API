import { Injectable } from '@nestjs/common';
import * as hbs from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

@Injectable()
export class ReceiptService {
  async create(createReceiptDto, baseUrl: string): Promise<Buffer> {
    const chromiumPack =
      'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar';
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

    let browser;
    try {
      // Logging to check executable path
      console.log('Using executable path:', await chromium.executablePath);

      browser = await puppeteer.launch({
        args: chromium.args,
        // See https://www.npmjs.com/package/@sparticuz/chromium#running-locally--headlessheadful-mode for local executable path
        executablePath: await chromium.executablePath(chromiumPack),
        headless: true,
      });

      console.log('Browser launched successfully');
    } catch (error) {
      console.error('Error launching browser:', error);
      throw new Error('Failed to launch browser.');
    }

    const page = await browser.newPage();
    await page.setContent(renderedHtml, { waitUntil: 'networkidle0' });

    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    const pdfBuffer = Buffer.from(pdfUint8Array);

    await browser.close();
    return pdfBuffer;
  }
}
