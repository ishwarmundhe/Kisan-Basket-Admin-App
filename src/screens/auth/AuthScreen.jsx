import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  TextInput,
} from "react-native";

import { useDispatch } from "react-redux";

import { ArrowLeft, Clock, Copy, User } from "lucide-react-native";
import { OtpInput } from "react-native-otp-entry";
// import {
//   useSendOtpMutation,
//   useLoginWithOtpMutation,
// } from '../../features/auth/authApi';
// import { updateCredentialsAndRefetch } from '../../features/auth/authSlice';

// import {
//   getCheckoutId,
//   storeCheckoutId,
//   storeTokens,
//   storeUser,
// } from '../../app/localStore';
import FarmerSvg from "../../assets/images/farmer.svg";
import Vector from "../../assets/images/Vector.svg";
import Vector2 from "../../assets/images/Vector2.svg";

import { showToast } from "../../lib/toast";
import Clipboard from "@react-native-clipboard/clipboard";
import { useKeyboardStatus } from "../../hook/useKeyboardStatus";
import { Button } from "../../components/ui/Button";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../constant/AuthProvider";

const PRIMARY_COLOR = "#658f3e";
const ERROR_COLOR = "#ef4444";
const GRAY_40 = "#D1D5DB";

export function AuthScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const otpInputRef = useRef(null);
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [receivedOtp, setReceivedOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(30);
  const [mobileError, setMobileError] = useState("");
  const [otpError, setOtpError] = useState("");

  const dispatch = useDispatch();
  const sendOtp = async () => {};
  const loginWithOtp = async () => {};

  const isSendingOtp = false;
  const isVerifyingOtp = false;
  //const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  //   const [loginWithOtp, { isLoading: isVerifyingOtp }] =
  //     useLoginWithOtpMutation();

  const keyboardVisible = useKeyboardStatus();

  const { width: screenWidth } = useWindowDimensions();

  const vectorWidth = screenWidth * 0.6;
  const vector2Width = screenWidth * 0.85;

  // Timer effect
  useEffect(() => {
    let timer;
    if (step === "otp" && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, otpTimer]);

  const otpTheme = useMemo(
    () => ({
      containerStyle: {
        marginBottom: 16,
      },
      pinCodeContainerStyle: {
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: otpError ? "#FEF2F2" : "#F3F4F6",
        borderColor: otpError
          ? ERROR_COLOR
          : otp.length > 0
            ? PRIMARY_COLOR
            : GRAY_40,
        width: 38,
        height: 46,
      },
      pinCodeTextStyle: {
        color: "#1F2937",
        fontSize: 20,
        fontWeight: "600",
      },
      focusStickStyle: {
        backgroundColor: PRIMARY_COLOR,
      },
      focusedPinCodeContainerStyle: {
        borderColor: otpError ? ERROR_COLOR : PRIMARY_COLOR,
        backgroundColor: otpError ? "#FEF2F2" : "#F0FDF4",
      },
    }),
    [otpError, otp.length]
  );

  const handleCopyOtp = useCallback(() => {
    if (receivedOtp) {
      Clipboard.setString(receivedOtp);
      showToast("success", "OTP copied to clipboard");
    }
  }, [receivedOtp]);

  const handleBackToMobile = useCallback(() => {
    setStep("mobile");
    setOtp("");
    setOtpError("");
    setReceivedOtp("");
    setOtpTimer(30);
    otpInputRef.current?.clear();
  }, []);

  const handleMobileChange = useCallback(
    (text) => {
      setMobile(text.replace(/\D/g, ""));
      if (mobileError) {
        setMobileError("");
      }
    },
    [mobileError]
  );

  const handleMobileSubmit = useCallback(async () => {
    setMobileError("");

    if (!mobile) {
      setMobileError("Please enter your mobile number.");
      return;
    }

    if (mobile.length !== 10) {
      setMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setStep("otp");
    setReceivedOtp("123456");
    return;

    try {
      const username = `+91${mobile}`;
      const res = "";
      //  const res = await sendOtp(username).unwrap();
      console.log(res);

      if (res?.data?.requestOtp?.otp) {
        const otpCode = res.data.requestOtp.otp;
        console.log("OTP Sent:", otpCode);
        setReceivedOtp(otpCode);
        setOtp("");
        setOtpError("");
        setStep("otp");
        setOtpTimer(30);
      } else if (res?.data?.requestOtp?.error) {
        setMobileError(res.data.requestOtp.error);
      } else {
        setMobileError("Could not send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);

      let errorMessage = "Failed to send OTP. Please try again.";

      if (err?.data?.errors && err.data.errors.length > 0) {
        errorMessage = err.data.errors[0].message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setMobileError(errorMessage);
    }
  }, [mobile, sendOtp]);

  const handleOtpChange = useCallback(
    (text) => {
      setOtp(text);
      if (otpError) {
        setOtpError("");
      }
    },
    [otpError]
  );

  //   const handleOtpSubmit = useCallback(async () => {
  //     setOtpError("");

  //     if (!otp) {
  //       setOtpError("Please enter the OTP code.");
  //       return;
  //     }

  //     if (otp.length !== 6) {
  //       setOtpError("Please enter the complete 6-digit code.");
  //       return;
  //     }

  //     navigation.navigate("MainTabs");

  //     // try {
  //     //   const phoneNumber = `+91${mobile}`;
  //     //   const response = "";
  //     //   //   const response = await loginWithOtp({
  //     //   //     phoneNumber: phoneNumber,
  //     //   //     otp,
  //     //   //   }).unwrap();
  //     //   console.log(response);

  //     //   const tokenData = response?.data?.tokenCreate;

  //     //   if (tokenData && tokenData.token) {
  //     //     const { token, refreshToken, user } = tokenData;

  //     //     await storeTokens({ token, refreshToken });
  //     //     await storeUser(user);
  //     //     dispatch(updateCredentialsAndRefetch({ token, refreshToken, user }));
  //     //     otpInputRef.current?.clear();
  //     //   } else if (tokenData?.errors && tokenData.errors.length > 0) {
  //     //     const errorMessage =
  //     //       tokenData.errors[0].message || "Invalid OTP. Please try again.";
  //     //     setOtpError(errorMessage);
  //     //     console.error("OTP verification failed:", errorMessage);
  //     //   } else {
  //     //     setOtpError("Invalid OTP. Please try again.");
  //     //   }
  //     // } catch (err) {
  //     //   console.error("Verify OTP error:", err);

  //     //   let errorMessage = "An unexpected error occurred. Please try again.";

  //     //   if (err?.data?.errors && err.data.errors.length > 0) {
  //     //     errorMessage = err.data.errors[0].message;
  //     //   } else if (err?.message) {
  //     //     errorMessage = err.message;
  //     //   }

  //     //   setOtpError(errorMessage);
  //     // }
  //   }, [otp, mobile, dispatch]);

  const handleOtpSubmit = useCallback(async () => {
    setOtpError("");

    if (!otp) {
      setOtpError("Please enter the OTP code.");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      const tokenData = {
        token: "fake-delivery-token-12345",
        refreshToken: "fake-delivery-refresh-token-67890",
        user: {
          id: "user-delivery-001",
          name: "Delivery Person",
        },
      };

      if (tokenData && tokenData.token) {
        const { token, refreshToken } = tokenData;
        const user = {
          ...tokenData.user,
          role: "DELIVERY",
        };
        await login(user, token, refreshToken);

        otpInputRef.current?.clear();
      } else {
        const errorMessage = "Invalid OTP. Please try again."; // Fake error
        setOtpError(errorMessage);
        console.error("OTP verification failed:", errorMessage);
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      let errorMessage = "An unexpected error occurred. Please try again.";
      setOtpError(errorMessage);
    }
  }, [otp, mobile, dispatch, login]);

  const handleResendOtp = useCallback(async () => {
    setOtp("");
    setOtpError("");
    setOtpTimer(30);
    otpInputRef.current?.clear();

    // try {
    //   const username = `+91${mobile}`;
    //   const res = await sendOtp(username).unwrap();

    //   if (res?.data?.requestOtp?.otp) {
    //     setReceivedOtp(res.data.requestOtp.otp);
    //     showToast("success", "OTP resent successfully");
    //   } else {
    //     setOtpError("Failed to resend OTP. Please try again.");
    //   }
    // } catch (err) {
    //   console.error("Resend OTP error:", err);

    //   let errorMessage = "Failed to resend OTP. Please try again.";

    //   if (err?.data?.errors && err.data.errors.length > 0) {
    //     errorMessage = err.data.errors[0].message;
    //   } else if (err?.message) {
    //     errorMessage = err.message;
    //   }

    //   setOtpError(errorMessage);
    // }
  }, [mobile, sendOtp]);

  return (
    <View className="flex-1 bg-white">
      {step === "otp" && (
        <View className="h-16 flex-row items-center justify-center px-4 mt-10 bg-white">
          <TouchableOpacity
            onPress={handleBackToMobile}
            className="absolute left-4"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">
            Verify Mobile
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mobile Number Screen */}
          {step === "mobile" && (
            <View className="flex-1">
              <View className="items-center mb-5 mt-20">
                <Text className="text-3xl text-gray-800 mb-2">Welcome to</Text>
                <View className="flex-row items-center mb-3">
                  <Text className="text-3xl text-gray-800">The </Text>
                  <Text className="text-3xl" style={{ color: PRIMARY_COLOR }}>
                    KisanBasket
                  </Text>
                  <Text className="text-3xl text-gray-800"> family</Text>
                </View>
                <Text className="text-base text-gray-600">
                  Direct Farm To Your Doorstep
                </Text>
              </View>

              {!keyboardVisible && (
                <View
                  className="w-full items-center mb-10"
                  style={{ overflow: "hidden" }}
                >
                  <View className="-mb-7">
                    <Vector width={vectorWidth} />
                  </View>
                  <Vector2 width={vector2Width} color={"#4b5563"} />
                </View>
              )}

              <View
                className={`flex-row items-center  ${
                  keyboardVisible ? "mb-2" : "mb-8"
                }`}
              >
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-600 text-base">Login</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              <View
                className={`bg-gray-50 rounded-2xl p-6  ${
                  keyboardVisible ? "mt-6" : "mb-0"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                <Text className="text-base text-gray-800 mb-4 font-medium">
                  Mobile Number
                </Text>

                <View className="mb-5">
                  <View
                    className="flex-row items-center rounded-lg px-4 h-14 bg-white"
                    style={{
                      borderWidth: 2,
                      borderColor: mobileError ? ERROR_COLOR : PRIMARY_COLOR,
                    }}
                  >
                    <Text className="text-gray-700 text-base font-medium mr-2">
                      +91
                    </Text>
                    <TextInput
                      placeholder="Enter your mobile number"
                      keyboardType="number-pad"
                      maxLength={10}
                      value={mobile}
                      onChangeText={handleMobileChange}
                      className="flex-1 text-base h-full"
                      style={{
                        backgroundColor: "transparent",
                        fontSize: 16,
                      }}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                      onSubmitEditing={handleMobileSubmit}
                    />
                  </View>

                  {mobileError ? (
                    <Text className="text-red-500 text-sm mt-2 ml-2">
                      {mobileError}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  onPress={handleMobileSubmit}
                  disabled={mobile.length !== 10 || isSendingOtp}
                  className={`h-14 rounded-lg items-center justify-center mb-4 ${
                    mobile.length === 10 && !isSendingOtp ? "" : "bg-gray-300"
                  }`}
                  style={
                    mobile.length === 10 && !isSendingOtp
                      ? { backgroundColor: PRIMARY_COLOR }
                      : {}
                  }
                >
                  <Text className="text-white text-base font-semibold">
                    {isSendingOtp ? "Sending..." : "Continue"}
                  </Text>
                </TouchableOpacity>

                <View
                  className={`flex-row items-center  ${
                    keyboardVisible ? "mb-2" : "mb-8"
                  }`}
                >
                  <View className="flex-1 h-px bg-gray-300" />

                  <View className="flex-1 h-px bg-gray-300" />
                </View>
                <Button
                  variant="outline"
                  className="flex-1 w-full border-2 border-[#658f3e] h-12 rounded-lg bg-white"
                  textClassName="text-[#658f3e]"
                  icon={<User size={18} color="#658f3e" />}
                  onPress={() => navigation.navigate("AdminLogin")}
                >
                  Login as Admin
                </Button>
              </View>
            </View>
          )}

          {/* OTP Verification Screen */}
          {step === "otp" && (
            <View
              className="flex-1"
              style={{ paddingTop: keyboardVisible ? 20 : 0 }}
            >
              <View className="items-center mb-">
                <Text className="text-2xl font-bold text-gray-900 mb-4">
                  Verify Your Number
                </Text>
                <Text className="text-base text-gray-600 text-center mb-2">
                  We've sent a 6-digit code to
                </Text>
                <Text
                  className="text-lg font-semibold"
                  style={{ color: PRIMARY_COLOR }}
                >
                  +91 {mobile}
                </Text>
              </View>

              {!keyboardVisible && (
                <View
                  className="w-full items-center mb-10"
                  style={{ overflow: "hidden" }}
                >
                  <View className="-mb-7">
                    <Vector width={vectorWidth} />
                  </View>
                  <Vector2 width={vector2Width} color={"#4b5563"} />
                </View>
              )}

              {receivedOtp && (
                <View
                  className="bg-blue-50 rounded-xl p-4 mb-6"
                  style={{ borderRadius: 10 }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-[8px] text-blue-600 mb-1 font-medium">
                        YOUR OTP (For Testing)
                      </Text>
                      <Text className="text-2xl font-bold text-blue-900 tracking-widest">
                        {receivedOtp}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleCopyOtp}
                      className="bg-blue-100 rounded-lg p-3"
                      activeOpacity={0.7}
                    >
                      <Copy size={20} color="#2563eb" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-[8px] text-blue-500 mt-2">
                    Tap icon to copy OTP
                  </Text>
                </View>
              )}

              <View
                className="bg-gray-50 rounded-2xl p-6 "
                style={{
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 10,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 20,
                  elevation: 20,
                }}
              >
                <Text className="text-center text-base font-medium text-gray-800 mb-6">
                  Enter 6-digit code
                </Text>

                <OtpInput
                  ref={otpInputRef}
                  numberOfDigits={6}
                  focusStickBlinkingDuration={500}
                  onTextChange={handleOtpChange}
                  textInputProps={{
                    accessibilityLabel: "One-Time Password",
                    autoFocus: true,
                    keyboardType: "number-pad",
                  }}
                  theme={otpTheme}
                />

                {otpError ? (
                  <Text className="text-red-500 text-sm mb-4 text-center">
                    {otpError}
                  </Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleOtpSubmit}
                  disabled={otp.length !== 6 || isVerifyingOtp}
                  className={`h-14 rounded-lg items-center justify-center mb-5 ${
                    otp.length === 6 && !isVerifyingOtp ? "" : "bg-gray-300"
                  }`}
                  style={
                    otp.length === 6 && !isVerifyingOtp
                      ? { backgroundColor: PRIMARY_COLOR }
                      : {}
                  }
                >
                  <Text className="text-white text-base font-semibold">
                    {isVerifyingOtp ? "Verifying..." : "Verify & Continue"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-center">
                  {otpTimer > 0 ? (
                    <View className="flex-row items-center">
                      <Clock size={16} color="#9CA3AF" />
                      <Text className="text-gray-600 ml-2 text-sm">
                        Resend code in {otpTimer}s
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp}>
                      <Text
                        style={{ color: PRIMARY_COLOR }}
                        className="font-semibold text-base"
                      >
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default React.memo(AuthScreen);
