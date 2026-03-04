import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../services/ledgerApi";
import { Plus, Edit2, Trash2 } from "lucide-react-native";
import { RefreshControl } from "react-native-gesture-handler";

export default function CategoriesManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");

  const {
    data: categories,
    isLoading,
    refetch,
    isFetching,
  } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isSaving }] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingCategory(item);
      setCode(item.code);
      setLabel(item.label);
    } else {
      setEditingCategory(null);
      setCode("");
      setLabel("");
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!code || !label) return Alert.alert("Error", "Fill all fields");
    const payload = { code: code.trim().toUpperCase(), label: label.trim() };
    try {
      if (editingCategory)
        await updateCategory({ id: editingCategory.id, ...payload }).unwrap();
      else await createCategory(payload).unwrap();
      setShowModal(false);
    } catch (e) {
      Alert.alert("Error", "Failed to save");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", onPress: () => deleteCategory(id) },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemCode}>{item.code}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleOpenModal(item)}
          style={styles.iconBtn}
        >
          <Edit2 size={18} color="#667085" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.iconBtn}
        >
          <Trash2 size={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={["#2E7D32"]}
            />
          }
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => handleOpenModal()}>
        <Plus size={24} color="white" />
      </TouchableOpacity>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "Edit Category" : "New Category"}
            </Text>
            <Text className="font-semibold">Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Code (e.g. SEEDS)"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <Text className="font-semibold">Label</Text>
            <TextInput
              style={styles.input}
              placeholder="Label (e.g. Seeds Purchase)"
              value={label}
              onChangeText={setLabel}
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLabel: { fontSize: 16, fontWeight: "600", color: "#101828" },
  itemCode: {
    fontSize: 12,
    color: "#667085",
    marginTop: 2,
    backgroundColor: "#F2F4F7",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  actions: { flexDirection: "row", gap: 10 },
  iconBtn: { padding: 6 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",

    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIconColor: "#fafafa",
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  saveBtnText: { color: "white", fontWeight: "600" },
  cancelBtn: { alignItems: "center", padding: 10 },
  cancelText: { color: "#667085", fontWeight: "500" },
});
