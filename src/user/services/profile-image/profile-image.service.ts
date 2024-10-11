import { Injectable } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { Repository } from 'typeorm';
import { User } from '../../models';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto'; // Using built-in crypto for hashing

@Injectable()
export class ProfileImageService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateProfileImage(id: string): Promise<Buffer> {
    const user: User = await this.userRepo.findOne({ where: { id: id } });

    // Dynamically generate initials based on available data
    const initials = this.generateShortText(
      user.firstName || '',
      user.lastName || '',
      user.email,
    );

    // Generate unique background color based on email
    const backgroundColor = this.generateUniqueColor(user.email);

    // Create a canvas for the profile image (200x200)
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');

    // Fill the background with the generated color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Determine if the text color should be light or dark based on background brightness
    const textColor = this.getContrastingTextColor(backgroundColor);

    // Set up a base64-encoded font (replace with your actual font file's base64 string)
    const fontBase64 = `YOUR_BASE64_ENCODED_FONT_HERE`; // Replace with actual font base64 string

    // Load the base64-encoded font into the canvas context
    context.font = `bold 90px "CustomFont"`;
    context.fillStyle = textColor;

    // Add the font to the canvas
    const style = `
      @font-face {
        font-family: "CustomFont";
        src: url(data:font/woff2;base64,${fontBase64}) format("woff2");
      }
    `;
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(style);
    document.adoptedStyleSheets = [styleSheet];

    // Measure the text width and height for centering
    const textMetrics = context.measureText(initials);
    const textWidth = textMetrics.width;
    const textHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent; // Actual text height

    // Center the initials both horizontally and vertically
    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height + textHeight) / 2; // Use actual text height to calculate the y-position

    context.fillText(initials, x, y);

    // Convert the canvas to a PNG buffer and return
    return canvas.toBuffer('image/png');
  }

  // Generate initials based on firstName, lastName, or email
  private generateShortText(
    firstName: string,
    lastName: string,
    email: string,
  ): string {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase(); // Initials from first name and last name
    } else if (firstName) {
      return firstName[0].toUpperCase(); // Initial from first name
    } else if (email) {
      return email[0].toUpperCase(); // Fallback: Initial from email
    }
    return 'U'; // Default if no data available
  }

  // Generate a unique color based on the email using a hash
  private generateUniqueColor(email: string): string {
    // Hash the email to generate a consistent seed
    const hash = createHash('sha256').update(email).digest('hex');

    // Use the first part of the hash as a seed for the hue in HSL (0-360 degrees)
    const hue = parseInt(hash.slice(0, 6), 16) % 360;

    // Return an HSL color with the calculated hue
    return `hsl(${hue}, 70%, 60%)`; // Saturation: 70%, Lightness: 60%
  }

  // Function to determine the best text color (light or dark) based on the background color's brightness
  private getContrastingTextColor(backgroundColor: string): string {
    // Remove the '#' if present and convert the color to an RGB value
    const color =
      backgroundColor.charAt(0) === '#'
        ? backgroundColor.substring(1, 7)
        : backgroundColor;
    const r = parseInt(color.substring(0, 2), 16); // Red component
    const g = parseInt(color.substring(2, 4), 16); // Green component
    const b = parseInt(color.substring(4, 6), 16); // Blue component

    // Calculate the brightness of the color using the YIQ formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return either black or white depending on brightness
    return brightness > 160 ? '#000000' : '#FFFFFF';
  }
}
