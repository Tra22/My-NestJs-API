import { Injectable } from '@nestjs/common';
import { createCanvas, registerFont } from 'canvas';
import { Repository } from 'typeorm';
import { User } from '../../models';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { join } from 'path';
@Injectable()
export class ProfileImageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateProfileImage(id: string): Promise<Buffer> {
    const user: User = await this.userRepo.findOne({ where: { id: id } });

    const initials = this.generateShortText(
      user.firstName || '',
      user.lastName || '',
      user.email,
    );

    const backgroundColor = this.generateUniqueColor(user.email);

    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const textColor = this.getContrastingTextColor(backgroundColor);
    const fontPath = join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'public',
      'fonts',
      'Roboto-Regular.ttf',
    );
    registerFont(fontPath, { family: 'Roboto' });

    context.font = 'bold 90px "Roboto"';
    context.fillStyle = textColor;

    const textMetrics = context.measureText(initials);
    const textWidth = textMetrics.width;
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;

    let x = (canvas.width - textWidth) / 2;

    // If the initials have 2 characters (like "TT"), adjust the spacing
    if (initials.length === 2) {
      const letterSpacing = 10; // Adjust this to control the space between characters
      x -= letterSpacing / 2; // Offset the start position for more even spacing
    }

    const y = (canvas.height + textHeight) / 2;

    // Draw each character manually to apply the spacing
    if (initials.length === 2) {
      const [firstChar, secondChar] = initials.split('');
      context.fillText(firstChar, x, y); // Draw first character
      context.fillText(secondChar, x + textMetrics.width / 2 + 10, y); // Draw second character with extra spacing
    } else {
      context.fillText(initials, x, y); // For single character initials
    }

    return canvas.toBuffer('image/png');
  }

  private generateShortText(
    firstName: string,
    lastName: string,
    email: string,
  ): string {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }

  private generateUniqueColor(email: string): string {
    const hash = createHash('sha256').update(email).digest('hex');
    const hue = parseInt(hash.slice(0, 6), 16) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  private getContrastingTextColor(backgroundColor: string): string {
    const color =
      backgroundColor.charAt(0) === '#'
        ? backgroundColor.substring(1, 7)
        : backgroundColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 160 ? '#000000' : '#FFFFFF';
  }
}
