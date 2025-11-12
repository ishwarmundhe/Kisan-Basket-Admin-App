import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Modal, Portal } from "react-native-paper";

const BackConfirmModal = ({ visible, onCancel, onConfirm }) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onCancel}
      contentContainerStyle={{
        backgroundColor: "white",
        padding: 20,
        margin: 20,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontSize: 16, marginBottom: 20 }}>
        Are you sure you want to go back? Your draft order will be cancelled.
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={onCancel} style={{ marginRight: 30 }}>
          <Text style={{ color: "gray" }}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirm}>
          <Text style={{ color: "red" }}>Yes</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  </Portal>
);

export default BackConfirmModal;
