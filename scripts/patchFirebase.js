const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "../node_modules/@react-native-firebase/app/android/src/reactnative/java/io/invertase/firebase/common/ReactNativeFirebaseModule.kt",
);

try {
  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, "utf8");
    if (content.includes("promise!!.reject(code, message, userInfoMap)")) {
      content = content.replace(
        /promise!!\.reject\(code, message, userInfoMap\)/g,
        'promise!!.reject(code ?: "UNKNOWN", message, userInfoMap)',
      );
      fs.writeFileSync(targetFile, content, "utf8");
      console.log(
        "[patchFirebase] Patched ReactNativeFirebaseModule.kt for React Native 0.82 / Kotlin 2.1",
      );
    }
  }
} catch (error) {
  console.warn("[patchFirebase] Warning while patching firebase module:", error);
}
