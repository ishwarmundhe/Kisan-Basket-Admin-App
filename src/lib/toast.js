import Toast from "react-native-toast-message";

/**
 * Shows a toast notification.
 * @param {'success' | 'error' | 'info'} type The type of toast.
 * @param {string} message The main message to display.
 * @param {string} [title] An optional title for the toast.
 */
export const showToast = (type, message, title) => {
  Toast.show({
    type: type, // 'success', 'error', 'info'
    text1: title,
    text2: message,
    position: "top",
    visibilityTime: 3000,
  });
};
