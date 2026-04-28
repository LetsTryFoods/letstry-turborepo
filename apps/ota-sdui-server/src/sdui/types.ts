export interface SDUIComponent {
  type: string;
  props: Record<string, any>;
}

export interface SDUIScreen {
  screen: string;
  components: SDUIComponent[];
  config?: Record<string, any>;
}
