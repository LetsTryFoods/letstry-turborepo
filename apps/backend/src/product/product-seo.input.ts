import { InputType } from '@nestjs/graphql';
import { SeoBaseInput } from '../seo-core/seo-base.input';

@InputType()
export class ProductSeoInput extends SeoBaseInput {}
