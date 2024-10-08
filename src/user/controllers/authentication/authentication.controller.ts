import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from '../../../global/payload/responses/Response';
import { AccessTokenSecurity, RefreshTokenSecurity } from '../../securities';
import { SerializeUser } from '../../decorators';
import { UserDto } from '../../dtos/responses';
import { RefreshtokenDto, RegisterDto, SigninDto } from '../../dtos/requests';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UpdateProfileDto } from '../../dtos/requests/authentication/update-profile.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenSecurity)
  @Get('user-info')
  getUser(@SerializeUser() user: UserDto): Response<UserDto> {
    return Response.data(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<Response<UserDto>> {
    return Response.data(await this.authenticationService.register(dto));
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() dto: SigninDto): Promise<
    Response<{
      access_token: string;
      refresh_token: string;
    }>
  > {
    return Response.data(await this.authenticationService.signin(dto));
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenSecurity)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(
    @SerializeUser() user: UserDto,
    @Body() dto: RefreshtokenDto,
  ): Promise<
    Response<{
      access_token: string;
    }>
  > {
    return Response.data(
      await this.authenticationService.refreshToken(user, dto),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenSecurity)
  @Patch('update-profile')
  async editUser(
    @SerializeUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<Response<UserDto>> {
    return Response.data(
      await this.authenticationService.updateUser(userId, dto),
    );
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenSecurity)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('signout')
  async signout(@SerializeUser() user: UserDto): Promise<Response<string>> {
    await this.authenticationService.signout(user);
    return Response.data('Successfully deleted user.');
  }
}
