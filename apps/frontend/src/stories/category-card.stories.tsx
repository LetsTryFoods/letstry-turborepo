import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CategoryCard } from '../components/category-grid/category-card';

const meta: Meta<typeof CategoryCard> = {
  title: 'Components/CategoryCard',
  component: CategoryCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    category: {
      id: '1',
      name: 'Purani Delhi',
      imageUrl: '/logo.webp',
      href: '/category/purani-delhi',
    },
  },
};

export const WithLongName: Story = {
  args: {
    category: {
      id: '2',
      name: 'Super Long Category Name to test wrapping',
      imageUrl: '/logo.webp',
      href: '/category/long-name',
    },
  },
};
