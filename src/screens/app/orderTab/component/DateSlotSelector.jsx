import React from "react";
import { TouchableOpacity, TextInput, View, Text } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Portal } from "react-native-paper";

const DateSlotSelector = ({
  theme,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      {/* Date Selection */}
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
        onPress={() => setShowPicker(true)}
      >
        <TextInput
          placeholder="Select Order Date"
          placeholderTextColor={theme.text}
          editable={false}
          style={{ flex: 1, fontSize: 16, color: theme.text }}
          value={selectedDate?.toLocaleDateString("en-CA")}
        />
        <Icon name="chevron-down-outline" size={25} color={theme.text} />
      </TouchableOpacity>

      {/* Slot Selection */}
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
        onPress={() => setVisible(true)}
      >
        <TextInput
          placeholder="Available Slots"
          placeholderTextColor={theme.text}
          editable={false}
          style={{ flex: 1, fontSize: 16, color: theme.text }}
          value={selectedSlot || ""}
        />
        <Icon name="chevron-down-outline" size={25} color={theme.text} />
      </TouchableOpacity>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          mode="date"
          display="default"
          value={selectedDate}
          onChange={(e, d) => {
            setShowPicker(false);
            if (d) setSelectedDate(d);
          }}
        />
      )}

      {/* Slot Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.primary,
            margin: 20,
            borderRadius: 8,
            padding: 20,
          }}
        >
          {["Morning", "Afternoon", "Evening"].map((slot, i) => (
            <TouchableOpacity key={i} onPress={() => setSelectedSlot(slot)}>
              <Text
                style={{
                  textAlign: "center",
                  padding: 10,
                  fontWeight: selectedSlot === slot ? "700" : "400",
                }}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </Modal>
      </Portal>
    </>
  );
};

export default DateSlotSelector;
