import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PackerCrudService } from '../core/packer-crud.service';

@Injectable()
export class PackerAuthService {
  constructor(
    private readonly packerCrud: PackerCrudService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(
    employeeId: string,
    password: string,
  ): Promise<any> {
    const packer = await this.packerCrud.findByEmployeeId(employeeId);
    if (!packer || !packer.isActive) return null;

    const isValid = await bcrypt.compare(password, packer.passwordHash);
    if (!isValid) return null;

    return packer;
  }

  async generateToken(packer: any): Promise<string> {
    return this.jwtService.sign({
      packerId: packer._id,
      employeeId: packer.employeeId,
      role: 'packer',
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
