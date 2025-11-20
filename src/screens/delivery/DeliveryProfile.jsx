import { useContext, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import {
  User,
  MapPin,
  Star,
  TrendingUp,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  CheckCircle, // CONVERTED: Added from lucide
} from "lucide-react-native"; // CONVERTED: from lucide-react
import { Button } from "../../components/ui/Button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/AlertDialog";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../constant/AuthProvider";

export default function DeliveryProfile() {
  // CONVERTED: Added state to control the dialog
  const { logout } = useContext(AuthContext); // --- FIX ---: Get logout function from context

  // --- FIX ---: Create a handler function for logout
  const handleLogout = () => {
    // First, call the logout function from your context
    logout();
    // Then, close the dialog
    setShowLogoutDialog(false);
  };
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    // CONVERTED: Added SafeAreaView and ScrollView for native layout
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* CONVERTED: All <div> tags are now <View> */}
        <View className="p-5 gap-y-5">
          {/* Header */}
          <View>
            {/* CONVERTED: All <h1> and <p> tags are now <Text> */}
            <Text className="text-[#1A1A1A] mb-1 text-2xl font-bold">
              Profile
            </Text>
            <Text className="text-[#6F6F6F] text-base">
              Manage your account
            </Text>
          </View>

          {/* Profile Card */}
          <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5">
            <View className="flex flex-row items-center gap-4 mb-5">
              <View className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1FAF68] to-[#11834B] flex items-center justify-center text-white border-4 border-white shadow-lg">
                <User size={32} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-[#1A1A1A] mb-1 text-lg font-semibold">
                  Arjun Sharma
                </Text>
                <View className="flex flex-row items-center gap-2 text-[#6F6F6F]">
                  <MapPin size={14} className="text-[#6F6F6F]" />
                  {/* CONVERTED: <span> to <Text> */}
                  <Text className="text-[#6F6F6F]">North Zone</Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            {/* CONVERTED: `grid grid-cols-3` to `flex-row` with `flex-1` children */}
            <View className="flex flex-row gap-3">
              <View className="flex-1 bg-white border border-[#DCE5E1] rounded-[14px] p-3 items-center">
                <Text className="text-[#1FAF68] mb-1 text-lg font-bold">
                  4.8
                </Text>
                <View className="flex flex-row items-center justify-center gap-1 text-[#6F6F6F]">
                  <Star size={12} className="text-[#6F6F6F]" />
                  <Text className="text-xs text-[#6F6F6F]">Rating</Text>
                </View>
              </View>
              <View className="flex-1 bg-white border border-[#DCE5E1] rounded-[14px] p-3 items-center">
                <Text className="text-[#1FAF68] mb-1 text-lg font-bold">
                  247
                </Text>
                <View className="flex flex-row items-center justify-center gap-1 text-[#6F6F6F]">
                  <TrendingUp size={12} className="text-[#6F6F6F]" />
                  <Text className="text-xs text-[#6F6F6F]">Deliveries</Text>
                </View>
              </View>
              <View className="flex-1 bg-white border border-[#DCE5E1] rounded-[14px] p-3 items-center">
                <Text className="text-[#1FAF68] mb-1 text-lg font-bold">
                  98%
                </Text>
                <View className="flex flex-row items-center justify-center gap-1 text-[#6F6F6F]">
                  <CheckCircle size={12} className="text-[#6F6F6F]" />
                  <Text className="text-xs text-[#6F6F6F]">Success</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5 gap-y-3">
            <Text className="text-[#1A1A1A] mb-2 text-base font-semibold">
              Contact Information
            </Text>

            <View className="flex flex-row items-center gap-3 p-3 bg-white border border-[#DCE5E1] rounded-[14px]">
              <Phone size={20} className="text-[#1FAF68]" />
              <View className="flex-1">
                <Text className="text-[#6F6F6F] text-sm">Phone Number</Text>
                <Text className="text-[#1A1A1A]">+91 98765 43210</Text>
              </View>
            </View>

            <View className="flex flex-row items-center gap-3 p-3 bg-white border border-[#DCE5E1] rounded-[14px]">
              <Mail size={20} className="text-[#1FAF68]" />
              <View className="flex-1">
                <Text className="text-[#6F6F6F] text-sm">Email</Text>
                <Text className="text-[#1A1A1A]">arjun.sharma@email.com</Text>
              </View>
            </View>
          </View>

          {/* Performance Overview */}
          <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] p-5">
            <Text className="text-[#1A1A1A] mb-4 text-base font-semibold">
              This Month's Performance
            </Text>
            <View className="gap-y-3">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-[#6F6F6F]">Total Deliveries</Text>
                <Text className="text-[#1A1A1A]">52</Text>
              </View>
              <View className="flex flex-row justify-between items-center">
                <Text className="text-[#6F6F6F]">Distance Covered</Text>
                <Text className="text-[#1A1A1A]">345 km</Text>
              </View>
              <View className="flex flex-row justify-between items-center">
                <Text className="text-[#6F6F6F]">Total Earnings</Text>
                <Text className="text-[#1FAF68] font-semibold">₹15,240</Text>
              </View>
              <View className="flex flex-row justify-between items-center">
                <Text className="text-[#6F6F6F]">Average Rating</Text>
                <Text className="text-[#1FAF68] font-semibold">4.8 ⭐</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-[#F6F8F7] border border-[#DCE5E1] rounded-[20px] overflow-hidden">
            {/* CONVERTED: <button> to <Pressable> */}
            <Pressable className="w-full flex flex-row items-center justify-between p-4 hover:bg-white transition-colors border-b border-[#DCE5E1]">
              <Text className="text-[#1A1A1A]">Edit Profile</Text>
              <ChevronRight size={20} className="text-[#6F6F6F]" />
            </Pressable>
            <Pressable className="w-full flex flex-row items-center justify-between p-4 hover:bg-white transition-colors border-b border-[#DCE5E1]">
              <Text className="text-[#1A1A1A]">Change Delivery Zone</Text>
              <ChevronRight size={20} className="text-[#6F6F6F]" />
            </Pressable>
            <Pressable className="w-full flex flex-row items-center justify-between p-4 hover:bg-white transition-colors">
              <Text className="text-[#1A1A1A]">Help & Support</Text>
              <ChevronRight size={20} className="text-[#6F6F6F]" />
            </Pressable>
          </View>

          {/* Logout Button */}
          {/* CONVERTED: Removed AlertDialogTrigger, using Button onPress directly */}
          <Button
            variant="outline"
            className="w-full h-12 rounded-[14px] border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white flex-row items-center justify-center"
            onPress={() => setShowLogoutDialog(true)} // CONVERTED: Set state on press
          >
            <LogOut size={20} className="mr-2 text-[#D32F2F]" />
            {/* CONVERTED: Wrapped text in <Text> */}
            <Text className="text-[#D32F2F]">Logout</Text>
          </Button>

          {/* CONVERTED: Added open and onOpenChange props */}
          <Modal
            transparent={true}
            animationType="fade"
            visible={showLogoutDialog}
            onRequestClose={() => setShowLogoutDialog(false)} // For Android back button
          >
            {/* Modal Overlay */}
            <View
              className="flex-1 justify-center items-center"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Semi-transparent background
            >
              {/* Modal Content Card */}
              <View className="w-4/5 max-w-sm bg-white rounded-2xl p-6 shadow-lg">
                {/* Header */}
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Confirm Logout
                </Text>
                {/* Description */}
                <Text className="text-base text-gray-600 mb-6">
                  Are you sure you want to logout? You'll need to login again to
                  access your account.
                </Text>
                {/* Footer with Buttons */}
                <View className="flex-row justify-end gap-x-3">
                  {/* Cancel Button */}
                  <Pressable
                    className="px-4 py-2 rounded-lg"
                    onPress={() => setShowLogoutDialog(false)}
                  >
                    <Text className="text-base font-medium text-gray-700">
                      Cancel
                    </Text>
                  </Pressable>
                  {/* Logout Button */}
                  <Pressable
                    className="px-4 py-2 rounded-lg bg-[#D32F2F]"
                    onPress={handleLogout}
                  >
                    <Text className="text-base font-medium text-white">
                      Logout
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
