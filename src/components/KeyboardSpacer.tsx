import { useState, useEffect } from "react";
import { Keyboard, Platform, View } from "react-native";

interface Props {
  topSpacing?: number;
}

export default function KeyboardSpacer({ topSpacing = 0 }: Props) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
    const hideEvent = Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const onShow = (e: any) => setKeyboardHeight(e.endCoordinates?.height ?? 0);
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const height = keyboardHeight > 0 ? keyboardHeight + topSpacing : 0;

  return <View style={{ height }} />;
}
