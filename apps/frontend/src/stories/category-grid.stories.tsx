import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CategoryGrid } from '../components/category-grid/category-grid';

const meta: Meta<typeof CategoryGrid> = {
  title: 'Components/CategoryGrid',
  component: CategoryGrid,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
