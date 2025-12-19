import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar } from "../components/navbar/navbar";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithScrolled: Story = {
  parameters: {
    backgrounds: {
      default: "gray",
    },
  },
};
