import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { AdminService } from '../../admin/admin.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminAuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) { }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminService.findByEmail(email);
    if (
      admin &&
      (await this.adminService.validatePassword(password, admin.password))
    ) {
      const { password: _, ...result } = admin.toObject();
      return result;
    }
    return null;
  }

  async validateJwtPayload(payload: any) {
    const admin = await this.adminService.findByEmail(payload.email);
    if (!admin) {
      return null;
    }
    const adminObj = admin.toObject();
    return { ...adminObj, role: Role.ADMIN };
  }

  async login(admin: any) {
    const payload = { email: admin.email, sub: admin._id, role: Role.ADMIN };
    const access_token = this.jwtService.sign(payload);
    // Prefix the admin ID so we can extract it later without a DB scan
    const randomHex = crypto.randomBytes(64).toString('hex');
    const refresh_token = `${admin._id.toString()}.${randomHex}`;

    await this.adminService.updateRefreshToken(admin._id.toString(), refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async generateAccessTokenOnly(admin: any) {
    const payload = { email: admin.email, sub: admin._id, role: Role.ADMIN };
    const access_token = this.jwtService.sign(payload);
    return access_token;
  }

  async verifyRefreshToken(adminId: string, refreshToken: string) {
    const admin = await this.adminService.findById(adminId);
    if (!admin || !admin.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isMatch = await bcrypt.compare(refreshToken, admin.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const adminObj = admin.toObject();
    return { ...adminObj, role: Role.ADMIN };
  }
}
