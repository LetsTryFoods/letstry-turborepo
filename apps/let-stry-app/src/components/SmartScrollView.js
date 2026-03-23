import React from "react";
import { ScrollView } from "react-native";

const SmartScrollView = React.forwardRef((props, ref) => (
  <ScrollView
    ref={ref}
    keyboardDismissMode="on-drag"
    keyboardShouldPersistTaps="handled"
    {...props}
  >
    {props.children}
  </ScrollView>
));

export default SmartScrollView;
