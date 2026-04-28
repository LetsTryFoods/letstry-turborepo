import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class DailySalesType {
  @Field()
  date: string;

  @Field(() => Int)
  orders: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
export class TopProductType {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  image?: string;

  @Field(() => Int)
  soldQuantity: number;

  @Field(() => Float)
  revenue: number;
}

@ObjectType()
export class TopCustomerType {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalSpent: number;
}

@ObjectType()
export class CategorySalesType {
  @Field()
  category: string;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class ReportSummaryType {
  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  totalCustomers: number;

  @Field(() => Float)
  avgOrderValue: number;

  @Field(() => Float)
  revenueGrowth: number;

  @Field(() => Float)
  ordersGrowth: number;

  @Field(() => Float)
  customersGrowth: number;
}

@ObjectType()
export class OrderReportResponse {
  @Field(() => ReportSummaryType)
  summary: ReportSummaryType;

  @Field(() => [DailySalesType])
  dailySales: DailySalesType[];

  @Field(() => [TopProductType])
  topProducts: TopProductType[];

  @Field(() => [TopCustomerType])
  topCustomers: TopCustomerType[];

  @Field(() => [CategorySalesType])
  categorySales: CategorySalesType[];
}
