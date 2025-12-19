import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/product';
import { ProductPageContainer } from '@/components/product-page/ProductPageContainer';
import { ProductDetails } from '@/components/product-page/ProductDetails';
import { ProductAccordion } from '@/components/product-page/ProductAccordion';
import { InfoTable } from '@/components/product-page/InfoTable';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id: slug } = await params;
  const { type } = await searchParams;
  
  const variant = type === 'special' ? 'special' : 'default';

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  const productInfo = [
    { label: 'Description', value: product.description },
    { label: 'Unit', value: product.defaultVariant?.packageSize || `${product.defaultVariant?.weight} ${product.defaultVariant?.weightUnit || ''}` },
    { label: 'Shelf life', value: product.shelfLife },
    { label: 'Diet preference', value: product.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian' },
    { label: 'Disclaimer', value: 'Every effort is made to maintain the accuracy of all information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.' },
  ];

  if (product.ingredients) {
     productInfo.splice(1, 0, { label: 'Ingredients', value: product.ingredients });
  }

  return (
    <ProductPageContainer variant={variant}>
      <ProductDetails product={product} />
      <ProductAccordion title="Product Info">
        <InfoTable data={productInfo} />
      </ProductAccordion>
    </ProductPageContainer>
  );
}
