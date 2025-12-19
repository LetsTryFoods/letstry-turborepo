import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HeroCarousel } from "../components/hero-carousel/hero-carousel";

const meta = {
  title: "Components/HeroCarousel",
  component: HeroCarousel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HeroCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
