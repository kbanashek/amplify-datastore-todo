import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorybookUI, configure } from "@storybook/react-native/V6";

// Import on-device addons
import "@storybook/addon-ondevice-controls/register";
import "@storybook/addon-ondevice-actions/register";

// Configure to load all stories
configure(() => {
  require("./test.stories.tsx");
  // Temporarily disabled to test
  // require("./ui-components.stories.tsx");
  // require("./domain-components.stories.tsx");
}, module);

// Get Storybook UI with proper on-device settings
const StorybookUIRoot = getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  shouldPersistSelection: true,
  onDeviceUI: true,
  // Enable the on-device navigator
  enableWebsockets: false,
  // Show the navigator by default
  isUIHidden: false,
  // Enable sidebar for navigation
  shouldDisableKeyboardAvoidingView: false,
});

export default StorybookUIRoot;
