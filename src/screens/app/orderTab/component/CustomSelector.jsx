import React from "react";
import { TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const CustomerSelector = ({ theme, selectedCustomer, onSelectCustomer }) => (
  <TouchableOpacity
    style={{
      flexDirection: "row",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      margin: 10,
      padding: 5,
      alignItems: "center",
    }}
    onPress={onSelectCustomer}
  >
    <TextInput
      placeholder="Select Customer Address"
      placeholderTextColor={theme.text}
      editable={false}
      style={{ flex: 1, fontSize: 16, color: theme.text }}
      value={
        selectedCustomer
          ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
          : ""
      }
    />
    <Icon name="chevron-down-outline" size={25} color={theme.text} />
  </TouchableOpacity>
);

export default CustomerSelector;
