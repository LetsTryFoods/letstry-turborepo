import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AdminAuthService } from '../authentication/admin/admin-auth.service';
import { AdminService } from './admin.service';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Admin } from './admin.schema';
import { JwtAuthGuard } from '../authentication/common/jwt-auth.guard';
import { Role } from '../common/enums/role.enum';

@Resolver()
export class AdminResolver {
  constructor(
    private authService: AdminAuthService,
    private adminService: AdminService,
  ) {}

  @Query(() => [Admin])
  @Public()
  async admins(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Mutation(() => String)
  @Public()
  async adminLogin(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context,
  ): Promise<string> {
    const admin = await this.authService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.login(admin);
    context.res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
      domain: process.env.NODE_ENV === 'production' ? '.letstryfoods.com' : undefined,
    });
    
    context.res.cookie('admin_refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.NODE_ENV === 'production' ? '.letstryfoods.com' : undefined,
    });
    
    return token.access_token;
  }

  @Mutation(() => String)
  @Public()
  async createAdmin(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const admin = await this.adminService.create({ email, password });
    return `Admin created with email: ${admin.email}`;
  }

  @Mutation(() => String)
  @Public()
  async adminLogout(@Context() context): Promise<string> {
    if (context.res) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'strict' as const,
        maxAge: 0,
        domain: process.env.NODE_ENV === 'production' ? '.letstryfoods.com' : undefined,
      };
      context.res.cookie('access_token', '', cookieOptions);
      context.res.cookie('admin_refresh_token', '', cookieOptions);
      
      // Attempt to clear from DB if we can parse the admin ID from the refresh token
      const refreshToken = context.req?.cookies?.admin_refresh_token;
      if (refreshToken && refreshToken.includes('.')) {
        const adminId = refreshToken.split('.')[0];
        try {
          await this.adminService.updateRefreshToken(adminId, null);
        } catch (e) {
          // ignore error if DB update fails on logout
        }
      }
    }
    return 'Admin logged out successfully';
  }

  /**
   * Admin-only: exchange a valid refresh token for a new access token.
   * Reads the `admin_refresh_token` cookie, validates it against the DB,
   * and issues fresh tokens.
   */
  @Mutation(() => String)
  @Public()
  async adminRefreshToken(
    @Context() context,
  ): Promise<string> {
    const refreshToken = context.req?.cookies?.admin_refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const parts = refreshToken.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Malformed refresh token');
    }
    
    const adminId = parts[0];
    let user;
    try {
      user = await this.authService.verifyRefreshToken(adminId, refreshToken);
    } catch (e) {
      // If validation fails, clear the cookies
      if (context.res) {
        context.res.cookie('access_token', '', { maxAge: 0 });
        context.res.cookie('admin_refresh_token', '', { maxAge: 0 });
      }
      throw e;
    }

    const token = await this.authService.login(user);

    // Refresh both cookies
    context.res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.letstryfoods.com' : undefined,
    });
    
    context.res.cookie('admin_refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.letstryfoods.com' : undefined,
    });

    return token.access_token;
  }
}
