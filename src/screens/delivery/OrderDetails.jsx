import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Phone,
  Camera,
  CheckCircle,
  Banknote,
  CreditCard,
  MessageSquare,
  X,
  Check,
  AlertCircle,
} from "lucide-react-native";
import { Button } from "../../components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
import { Badge } from "../../components/ui/Badge";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";

// Constants
const DEMO_OTP = "1234";
const DELIVERY_FEE = 30;
const COMMISSION_RATE = 0.1;

const DELIVERY_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PICKED: "picked",
  OUT_FOR_DELIVERY: "out-for-delivery",
  ARRIVED: "arrived",
  PAYMENT: "payment",
  COMPLETED: "completed",
};

const STATUS_CONFIG = {
  [DELIVERY_STATUSES.PENDING]: { label: "Pending", color: "orange" },
  [DELIVERY_STATUSES.ACCEPTED]: { label: "Accepted", color: "blue" },
  [DELIVERY_STATUSES.PICKED]: { label: "Picked", color: "blue" },
  [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: { label: "Delivering", color: "blue" },
  [DELIVERY_STATUSES.ARRIVED]: { label: "Arrived", color: "blue" },
  [DELIVERY_STATUSES.PAYMENT]: { label: "Payment", color: "blue" },
  [DELIVERY_STATUSES.COMPLETED]: { label: "Completed", color: "green" },
};

const MOCK_ITEMS = [
  { name: "Tomato (1 kg)", price: 40 },
  { name: "Potato (2 kg)", price: 60 },
  { name: "Onion (1 kg)", price: 35 },
  { name: "Carrot (0.5 kg)", price: 25 },
  { name: "Apple (1 kg)", price: 120 },
];

const PAYMENT_METHODS = {
  CASH: "cash",
  UPI: "upi",
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status];

  const styleMap = {
    orange: {
      container: "bg-orange-100 border-orange-200 rounded",
      text: "text-orange-600",
    },
    blue: {
      container: "bg-blue-100 border-blue-200 rounded",
      text: "text-blue-600",
    },
    green: {
      container: "bg-green-100 border-green-200 rounded",
      text: "text-green-600",
    },
  };

  const currentTheme = styleMap[config.color];

  return (
    <Badge
      // Apply background to the badge container
      className={currentTheme.container}
      variant="outline"
    >
      <Text className={`font-medium ${currentTheme.text}`}>{config.label}</Text>
    </Badge>
  );
};
const OrderHeader = ({ order, status, onBack }) => (
  <View className="bg-white border-b border-[#DCE5E1] px-5 py-4 flex flex-row items-center justify-between z-10">
    <View className="flex flex-row items-center gap-3">
      <Pressable
        onPress={onBack}
        className="p-2 hover:bg-[#F6F8F7] rounded-lg transition-colors"
      >
        <ArrowLeft size={20} className="text-[#1A1A1A]" />
      </Pressable>
      <View>
        <Text className="text-[#1A1A1A]">Order #{order?.id}</Text>
        <Text className="text-[#6F6F6F]">{order?.time}</Text>
      </View>
    </View>
    <StatusBadge status={status} />
  </View>
);

const PendingOrderAlert = ({ onAccept, onReject }) => (
  <View className="bg-orange-50 border-2 border-orange-200 rounded-[20px] p-5 gap-y-3">
    <View className="flex flex-row items-start gap-3">
      <AlertCircle
        className="text-orange-600 mt-0.5"
        size={20}
        color={"#ea580c"}
      />
      <View className="flex-1">
        <Text className="text-orange-900 mb-1">New Order Received!</Text>
        <Text className="text-orange-700 text-sm">
          Accept this order to start delivery
        </Text>
      </View>
    </View>
    <View className="flex flex-row gap-2">
      <Button
        onPress={onAccept}
        className="flex-1 h-12 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] flex-row items-center justify-center"
      >
        <Check size={20} className="mr-2 text-white" color={"#fff"} />
        <Text className="text-white">Accept Order</Text>
      </Button>
      <Button
        onPress={onReject}
        variant="outline"
        className="h-12 px-6 rounded-[14px] border-[#D32F2F] text-[#D32F2F] hover:bg-red-50"
      >
        <X size={20} className="text-[#D32F2F]" color={"#D32F2F"} />
      </Button>
    </View>
  </View>
);

const MapPreview = ({ order, status }) => (
  <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] overflow-hidden">
    <LinearGradient
      colors={["#7ED9A9", "#1FAF68"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="aspect-video relative flex items-center justify-center"
    >
      <MapPin className="text-white" size={48} />

      <View className="absolute top-3 right-3 bg-white rounded-lg px-3 py-1.5 shadow-lg">
        <Text className="text-[#1A1A1A]">{order?.distance}</Text>
      </View>

      {status === DELIVERY_STATUSES.OUT_FOR_DELIVERY && (
        <View className="absolute bottom-3 left-3 right-3">
          <View className="bg-white rounded-xl p-3 shadow-lg">
            <View className="flex flex-row items-center justify-between mb-2">
              <Text className="text-[#6F6F6F] text-sm">Estimated arrival</Text>
              <Text className="text-[#1FAF68]">15 mins</Text>
            </View>
            <View className="w-full bg-[#F6F8F7] rounded-full h-2">
              <View
                className="bg-[#1FAF68] h-full rounded-full animate-pulse"
                style={{ width: "60%" }}
              />
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
    {/* END GRADIENT */}

    {status !== DELIVERY_STATUSES.PENDING && (
      <View className="p-3 bg-white border-t border-[#DCE5E1] flex flex-row gap-2">
        <Button className="flex-1 h-10 rounded-lg bg-[#1FAF68] hover:bg-[#11834B] flex-row items-center justify-center gap-x-3">
          <Navigation size={16} className="mr-2 text-white" color={"#fff"} />
          <Text className="text-white">Navigate</Text>
        </Button>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-lg border-[#1FAF68] text-[#1FAF68]"
        >
          <Phone size={16} className="text-[#1FAF68]" color={"#1FAF68"} />
        </Button>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-lg border-[#1FAF68] text-[#1FAF68]"
        >
          <MessageSquare
            size={16}
            className="text-[#1FAF68]"
            color={"#1FAF68"}
          />
        </Button>
      </View>
    )}
  </View>
);

const CustomerInfo = ({ order }) => (
  <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5 gap-y-3">
    <Text className="text-[#1A1A1A]">Customer Details</Text>
    <View className="gap-y-2">
      <InfoRow label="Name" value={order?.customerName} />
      <InfoRow label="Phone" value="+91 98765 43210" />
      <View className="flex flex-row items-start justify-between gap-3 pt-2 border-t border-[#DCE5E1]">
        <Text className="text-[#6F6F6F]">Address</Text>
        <Text className="text-[#1A1A1A] text-right flex-1">
          {order?.address}
        </Text>
      </View>
    </View>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View className="flex flex-row justify-between">
    <Text className="text-[#6F6F6F]">{label}</Text>
    <Text className="text-[#1A1A1A]">{value}</Text>
  </View>
);

const OrderItems = ({ itemCount, status }) => {
  const items = useMemo(() => MOCK_ITEMS.slice(0, itemCount), [itemCount]);

  return (
    <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5 gap-y-3">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-[#1A1A1A]">Items to Pick ({itemCount})</Text>
        {status === DELIVERY_STATUSES.ACCEPTED && (
          <Badge className="bg-blue-100 rounded border-blue-600">
            <Text className="text-blue-600 text-sm">Pick items</Text>
          </Badge>
        )}
      </View>
      <View className="gap-y-2">
        {items.map((item, idx) => (
          <ItemRow
            key={idx}
            item={item}
            isPicked={status !== DELIVERY_STATUSES.PENDING}
          />
        ))}
      </View>
    </View>
  );
};

const ItemRow = ({ item, isPicked }) => (
  <View className="flex flex-row items-center justify-between bg-white border border-[#DCE5E1] rounded-lg p-3">
    <Text className="text-[#1A1A1A]">{item.name}</Text>
    <View className="flex flex-row items-center gap-2">
      <Text className="text-[#6F6F6F]">₹{item.price}</Text>
      {isPicked && (
        <View className="w-5 h-5 rounded-full bg-[#1FAF68] flex items-center justify-center">
          <Check size={14} className="text-white" color={"#fff"} />
        </View>
      )}
    </View>
  </View>
);

const PaymentSummary = ({ orderValue }) => {
  const total = orderValue + DELIVERY_FEE;

  return (
    <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5">
      <Text className="text-[#1A1A1A] mb-3">Payment Summary</Text>
      <View className="gap-y-2">
        <InfoRow label="Items Total" value={`₹${orderValue}`} />
        <InfoRow label="Delivery Fee" value={`₹${DELIVERY_FEE}`} />
        <View className="flex flex-row justify-between pt-2 border-t border-[#DCE5E1]">
          <Text className="text-[#1A1A1A]">Total to Collect</Text>
          <Text className="text-[#1FAF68]">₹{total}</Text>
        </View>
        <View className="flex flex-row justify-between pt-2 border-t border-[#DCE5E1]">
          <Text className="text-[#6F6F6F]">Payment Method</Text>
          <Badge className="bg-white  border border-[#DCE5E1] rounded">
            <Text className="text-[#1A1A1A] text-sm font-semibold ">
              {" "}
              Cash on Delivery
            </Text>
          </Badge>
        </View>
      </View>
    </View>
  );
};

const ActionButton = ({ status, onAction }) => {
  const buttonConfig = {
    [DELIVERY_STATUSES.ACCEPTED]: {
      text: "Start Picking Items",
      icon: null,
    },
    [DELIVERY_STATUSES.PICKED]: {
      text: "Start Delivery",
      icon: <Navigation size={20} className="mr-2 text-white" color={"#fff"} />,
    },
    [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: {
      text: "I've Arrived",
      icon: <MapPin size={20} className="mr-2 text-white" color={"#fff"} />,
    },
    [DELIVERY_STATUSES.PAYMENT]: {
      text: "Payment",
      icon: <MapPin size={20} className="mr-2 text-white" color={"#fff"} />,
    },
    [DELIVERY_STATUSES.COMPLETED]: {
      text: "Completed",
      icon: <MapPin size={20} className="mr-2 text-white" color={"#fff"} />,
    },
  };

  const config = buttonConfig[status];
  if (!config) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-[#DCE5E1] p-5">
      <Button
        onPress={onAction}
        className="w-full h-12  gap-x-3 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] flex-row items-center justify-center"
      >
        {config.icon}
        <Text className="text-white">{config.text}</Text>
      </Button>
    </View>
  );
};

const CompletedState = ({ earnings }) => (
  <View className="absolute bottom-0 left-0 right-0 bg-[#1FAF68] p-6 text-center items-center">
    <CheckCircle className="text-white mb-3" size={48} />
    <Text className="text-white mb-2">Delivery Completed!</Text>
    <Text className="text-white/90 text-sm">Earnings: ₹{earnings}</Text>
  </View>
);

export default function OrderDetailsEnhanced({ order, onBack }) {
  const [deliveryStatus, setDeliveryStatus] = useState(
    DELIVERY_STATUSES.PENDING
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);

  // Memoized calculations
  const totalAmount = useMemo(
    () => order?.value + DELIVERY_FEE,
    [order?.value]
  );
  const earnings = useMemo(
    () => Math.round(totalAmount * COMMISSION_RATE),
    [totalAmount]
  );

  // Callbacks
  const handleAcceptOrder = useCallback(() => {
    setDeliveryStatus(DELIVERY_STATUSES.ACCEPTED);
  }, []);

  const handleRejectOrder = useCallback(() => {
    setShowRejectDialog(false);
    setTimeout(() => onBack(), 1000);
  }, [onBack]);

  const handleStartPicking = useCallback(() => {
    setDeliveryStatus(DELIVERY_STATUSES.PICKED);
  }, []);

  const handleStartDelivery = useCallback(() => {
    setDeliveryStatus(DELIVERY_STATUSES.OUT_FOR_DELIVERY);
  }, []);

  const handleArrivedAtLocation = useCallback(() => {
    setDeliveryStatus(DELIVERY_STATUSES.ARRIVED);
    setShowOTPDialog(true);
  }, []);

  const handleVerifyOTP = useCallback(() => {
    if (otp === DEMO_OTP) {
      setShowOTPDialog(false);
      setDeliveryStatus(DELIVERY_STATUSES.PAYMENT);
      setShowPaymentDialog(true);
    }
  }, [otp]);

  const handlePaymentCollected = useCallback(() => {
    if (!selectedPaymentMethod) return;
    setShowPaymentDialog(false);
    setShowPhotoDialog(true);
  }, [selectedPaymentMethod]);

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera for delivery proof.",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Camera permission granted");
          return true;
        } else {
          console.log("Camera permission denied");
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleLaunchCamera = useCallback(async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log("Camera permission denied by user.");
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.7,
      saveToPhotos: false,
      cameraType: "front",
    };

    try {
      const response = await launchCamera(options);

      if (response.didCancel) {
        console.log("User cancelled camera");
      } else if (response.errorCode) {
        console.log("Camera Error: ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        setDeliveryPhoto(imageUri);
      }
    } catch (error) {
      console.log("Error launching camera: ", error);
    }
  }, []);

  const handleCompleteDelivery = useCallback(() => {
    setShowPhotoDialog(false);
    setDeliveryStatus(DELIVERY_STATUSES.COMPLETED);
    setTimeout(() => onBack(), 2000);
  }, [onBack]);

  const handleOTPChange = useCallback((text) => {
    setOtp(text.replace(/\D/g, ""));
  }, []);

  const actionHandlers = {
    [DELIVERY_STATUSES.ACCEPTED]: handleStartPicking,
    [DELIVERY_STATUSES.PICKED]: handleStartDelivery,
    [DELIVERY_STATUSES.OUT_FOR_DELIVERY]: handleArrivedAtLocation,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <OrderHeader order={order} status={deliveryStatus} onBack={onBack} />

      <ScrollView
        className="p-5"
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="gap-y-5">
          {deliveryStatus === DELIVERY_STATUSES.PENDING && (
            <PendingOrderAlert
              onAccept={handleAcceptOrder}
              onReject={() => setShowRejectDialog(true)}
            />
          )}

          <MapPreview order={order} status={deliveryStatus} />
          <CustomerInfo order={order} />
          <OrderItems itemCount={order?.items} status={deliveryStatus} />
          <PaymentSummary orderValue={order?.value} />

          {deliveryStatus === DELIVERY_STATUSES.OUT_FOR_DELIVERY && (
            <View className="bg-blue-50 border border-blue-200 rounded-[20px] p-5">
              <Text className="text-blue-900 mb-2">Delivery Instructions</Text>
              <Text className="text-blue-700 text-sm">
                Ring the bell twice. Leave at door if no response.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ActionButton
        status={deliveryStatus}
        onAction={actionHandlers[deliveryStatus]}
      />

      {deliveryStatus === DELIVERY_STATUSES.COMPLETED && (
        <CompletedState earnings={earnings} />
      )}

      {/* Dialogs */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Reject Order?</DialogTitle>
          </DialogHeader>
          <View className="py-4">
            <Text className="text-[#6F6F6F] mb-4">
              Are you sure you want to reject this order? This will affect your
              acceptance rate.
            </Text>
            <View className="flex flex-row gap-3">
              <Button
                onPress={() => setShowRejectDialog(false)}
                variant="outline"
                className="flex-1 h-12 rounded-[14px]"
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                onPress={handleRejectOrder}
                className="flex-1 h-12 rounded-[14px] bg-[#D32F2F] hover:bg-[#B71C1C]"
              >
                <Text className="text-white">Reject</Text>
              </Button>
            </View>
          </View>
        </DialogContent>
      </Dialog>

      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
          </DialogHeader>
          <View className="py-4 gap-y-4">
            <Text className="text-[#6F6F6F] text-center">
              Ask customer for 4-digit OTP
            </Text>
            <TextInput
              keyboardType="numeric"
              maxLength={4}
              value={otp}
              onChangeText={handleOTPChange}
              placeholder="Enter OTP"
              className="h-14 text-center text-2xl tracking-widest bg-white border border-[#DCE5E1] rounded-[14px]"
            />
            <Text className="text-[#6F6F6F] text-xs text-center">
              Demo OTP: {DEMO_OTP}
            </Text>
            <Button
              onPress={handleVerifyOTP}
              disabled={otp.length !== 4}
              className="w-full h-12 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] disabled:bg-[#DCE5E1]"
            >
              <Text className="text-white">Verify OTP</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          <View className="py-4 gap-y-4">
            <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[14px] p-4 items-center">
              <Text className="text-[#6F6F6F] mb-2">Amount to Collect</Text>
              <Text className="text-[#1FAF68]">{totalAmount}</Text>
            </View>

            <View className="gap-y-3">
              <Text className="text-[#1A1A1A]">Select Payment Method</Text>
              <View className="flex flex-row gap-3">
                <Pressable
                  onPress={() => setSelectedPaymentMethod(PAYMENT_METHODS.CASH)}
                  className={`flex-1 border-2 rounded-[14px] p-4 flex flex-col items-center gap-2 ${
                    selectedPaymentMethod === PAYMENT_METHODS.CASH
                      ? "border-[#1FAF68] bg-[#F6F8F7]"
                      : "border-[#DCE5E1] bg-white"
                  }`}
                >
                  <Banknote className="text-[#1FAF68]" size={32} />
                  <Text className="text-[#1A1A1A]">Cash</Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedPaymentMethod(PAYMENT_METHODS.UPI)}
                  className={`flex-1 border-2 rounded-[14px] p-4 flex flex-col items-center gap-2 ${
                    selectedPaymentMethod === PAYMENT_METHODS.UPI
                      ? "border-[#1FAF68] bg-[#F6F8F7]"
                      : "border-[#DCE5E1] bg-white"
                  }`}
                >
                  <CreditCard className="text-[#1FAF68]" size={32} />
                  <Text className="text-[#1A1A1A]">UPI/QR</Text>
                </Pressable>
              </View>
            </View>

            {selectedPaymentMethod === PAYMENT_METHODS.UPI && (
              <View className="bg-white border-2 border-[#1FAF68] rounded-[14px] p-4">
                <View className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3 border border-[#DCE5E1]">
                  <View className="w-40 h-40 bg-gray-300" />
                  <Text className="absolute">QR Code Placeholder</Text>
                </View>
                <Text className="text-center text-[#6F6F6F] text-sm mb-2">
                  Customer scans this QR code
                </Text>
                <Text className="text-center text-[#1FAF68]">
                  kisanbasket@upi
                </Text>
              </View>
            )}

            <Button
              onPress={handlePaymentCollected}
              disabled={!selectedPaymentMethod}
              className="w-full h-12 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] disabled:bg-[#DCE5E1]"
            >
              <CheckCircle size={20} className="mr-2 text-white" />
              <Text className="text-white">
                {selectedPaymentMethod === PAYMENT_METHODS.CASH
                  ? "Cash Collected"
                  : "Payment Received"}
              </Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Delivery Proof</DialogTitle>
          </DialogHeader>
          <View className="py-4 gap-y-4">
            <Text className="text-[#6F6F6F] text-center">
              Take a photo of the delivered items for confirmation
            </Text>

            {deliveryPhoto ? (
              <View className="gap-y-3">
                <View className="aspect-square bg-[#F6F8F7] rounded-[14px] overflow-hidden border-2 border-[#1FAF68]">
                  <Image
                    source={{ uri: deliveryPhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <Button
                  variant="outline"
                  onPress={() => setDeliveryPhoto(null)}
                  className="w-full h-10 rounded-lg border-[#DCE5E1]"
                >
                  <Text>Retake Photo</Text>
                </Button>
              </View>
            ) : (
              <TouchableOpacity onPress={handleLaunchCamera}>
                <View className="bg-[#F6F8F7] border-2 border-dashed border-[#DCE5E1] rounded-[14px] p-12 flex flex-col items-center gap-3 hover:border-[#1FAF68] transition-colors">
                  <TouchableOpacity
                    onPress={handleLaunchCamera}
                    className="flex flex-col items-center"
                  >
                    <Camera className="text-[#6F6F6F]" size={48} />
                    <Text className="text-[#6F6F6F]">Tap to capture photo</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}

            <Button
              onPress={handleCompleteDelivery}
              disabled={!deliveryPhoto}
              className="w-full h-12 rounded-[14px] bg-[#1FAF68] hover:bg-[#11834B] disabled:bg-[#DCE5E1]"
            >
              <CheckCircle size={20} className="mr-2 text-white" />
              <Text className="text-white">Complete Delivery</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}
