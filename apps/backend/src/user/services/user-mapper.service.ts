import { Injectable } from '@nestjs/common';
import { User } from '../user.schema';
import { IdentityDocument } from '../../common/schemas/identity.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UserMapperService {
  mapToUser(identity: IdentityDocument): User {
    return {
      _id: identity._id.toString(),
      phoneNumber: identity.phoneNumber || '',
      firstName: identity.firstName || '',
      lastName: identity.lastName || '',
      email: identity.email,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      lastLoginAt: identity.lastLoginAt,
      lifetimeValue: identity.lifetimeValue,
      marketingSmsOptIn: identity.marketingSmsOptIn,
      signupSource: identity.signupSource,
      lastIp: identity.lastIp || '',
      role: identity.role as Role,
      isPhoneVerified: identity.isPhoneVerified,
      firstAuthMethod: identity.firstAuthMethod,
      lastAuthMethod: identity.lastAuthMethod,
      mergedGuestIds: identity.mergedGuestIds,
    };
  }
}
