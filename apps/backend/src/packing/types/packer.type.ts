import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Packer {
  @Field(() => ID)
  id: string;

  @Field()
  employeeId: string;

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  totalOrdersPacked: number;

  @Field(() => Float)
  accuracyRate: number;

  @Field(() => Float)
  averagePackTime: number;

  @Field(() => Int)
  assignedOrders: number;

  @Field(() => Int)
  inProgressOrders: number;

  @Field(() => Int)
  completedOrders: number;

  @Field({ nullable: true })
  lastActiveAt?: Date;
}

@ObjectType()
export class PackerStats {
  @Field(() => ID)
  packerId: string;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  accuracyRate: number;

  @Field(() => Float)
  averagePackTime: number;

  @Field(() => [ErrorStat])
  errorsByType: ErrorStat[];

  @Field(() => Int)
  ordersPackedToday: number;
}

@ObjectType()
export class ErrorStat {
  @Field()
  errorType: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class PackerLoginResponse {
  @Field()
  accessToken: string;

  @Field(() => Packer)
  packer: Packer;
}

@ObjectType()
export class CreatePackerResponse {
  @Field(() => Packer)
  packer: Packer;

  @Field()
  generatedPassword: string;
}
