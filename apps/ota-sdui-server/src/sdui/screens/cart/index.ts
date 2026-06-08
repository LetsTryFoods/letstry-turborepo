import { SDUIScreen } from "../../types";

export const cartScreen: SDUIScreen = {
  screen: "CartDrawer",
  components: [
    {
      type: "CartNotice",
      props: {
        text: "Orders after April 14th may face delivery related issues. ❤️",
        backgroundColor: "#FFF9C4",
        textColor: "#5D4037",
        borderRadius: 10,
        borderColor: "#FBC02D",
        borderWidth: 1,
        marginVertical: 12,
        padding: 10,
      },
    },
  ],
  config: {
    checkoutBtnLabel: "Confirm Order",
    showCheckoutArrow: true,
    checkoutBtnStyle: {
      backgroundColor: "#0C5273",
      borderRadius: 8,
    },
    checkoutBtnTextStyle: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
  },
};
