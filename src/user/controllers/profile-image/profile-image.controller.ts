import { Controller, Get, Param, Res } from '@nestjs/common';
import { ProfileImageService } from '../../services/profile-image/profile-image.service';
import { Response } from 'express';

@Controller('profile-image')
export class ProfileImageController {
  constructor(private readonly profileImageService: ProfileImageService) {}

  @Get(':id')
  async generateProfileImage(@Param('id') id: string, @Res() res: Response) {
    const imageBuffer = await this.profileImageService.generateProfileImage(id);

    // Set the response headers and send the image buffer as a PNG image
    res.setHeader('Content-Type', 'image/png');
    res.send(imageBuffer);
  }
}
