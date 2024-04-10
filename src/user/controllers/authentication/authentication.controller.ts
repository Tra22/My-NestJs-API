import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'src/global/payload/responses/Response';
import { SerializeUser } from 'src/user/decorators';
import { RefreshtokenDto, RegisterDto, SigninDto } from 'src/user/dtos/requests';
import { UpdateProfileDto } from 'src/user/dtos/requests/authentication/update-profile.dto';
import { UserDto } from 'src/user/dtos/responses';
import { AccessTokenSecurity, RefreshTokenSecurity } from 'src/user/securities';
import { AuthenticationService } from 'src/user/services/authentication/authentication.service';

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}
    
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
    async signin(@Body() dto: SigninDto): Promise<Response<{
      access_token: string;
      refresh_token: string;
    }>> {
      return Response.data(await this.authenticationService.signin(dto));
    }
  
    @UseGuards(RefreshTokenSecurity)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refreshToken(
      @SerializeUser() user: UserDto,
      @Body() dto: RefreshtokenDto,
    ): Promise<Response<{
      access_token: string;
    }>> {
      return Response.data(await this.authenticationService.refreshToken(user, dto));
    }
  
    @UseGuards(AccessTokenSecurity)
    @Patch('update-profile')
    async editUser(
      @SerializeUser('id') userId: string,
      @Body() dto: UpdateProfileDto,
    ): Promise<Response<UserDto>> {
      return Response.data(await this.authenticationService.updateUser(userId, dto));
    }

    @UseGuards(RefreshTokenSecurity)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('signout')
    async signout(@SerializeUser() user: UserDto): Promise<Response<string>> {
      await this.authenticationService.signout(user);
      return Response.data("Successfully deleted user.");
    }
}
