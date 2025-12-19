import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TopBanner } from '../components/top-banner/top-banner';

const meta: Meta<typeof TopBanner> = {
  title: 'Components/TopBanner',
  component: TopBanner,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopBanner>;

export const TextFallback: Story = {
  args: {},
};

export const CustomItems: Story = {
  args: {
    items: [
      'Organic',
      'Gluten Free',
      'Non-GMO',
      'Vegan',
    ],
  },
};

export const WithImage: Story = {
  args: {
    imageUrl: '/banner-image.png',
    imageAlt: 'Promotional Banner',
  },
};
