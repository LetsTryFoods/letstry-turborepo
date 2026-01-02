import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Identity,
  IdentityDocument,
  IdentityStatus,
} from '../../common/schemas/identity.schema';

@Injectable()
export class UserActivityService {
  constructor(
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
  ) {}

  async updateUserActivity(userId: string): Promise<boolean> {
    const result = await this.identityModel
      .updateOne(
        {
          _id: userId,
          status: {
            $in: [
              IdentityStatus.REGISTERED,
              IdentityStatus.VERIFIED,
              IdentityStatus.ACTIVE,
            ],
          },
        },
        { lastActiveAt: new Date() },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
