import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import {
  useGetEntriesQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
  useSearchEntryTypesQuery,
  useSearchCategoriesQuery,
} from "../../../services/ledgerApi";
import SearchableDropdown from "../../../screens/admin/components/SearchableDropdown";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  Edit2,
  X,
} from "lucide-react-native";
import { format, addDays, subDays } from "date-fns";
import { toast } from "sonner-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../../constant/ThemeContext"; // Import Theme Context

export default function EntriesManagement() {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  // --- State ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTypeObj, setSelectedTypeObj] = useState(null);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);

  // Search State
  const [typeSearch, setTypeSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // --- API Hooks ---
  const apiDate = format(selectedDate, "yyyy-MM-dd");
  const displayDate = format(selectedDate, "dd MMM yyyy");

  const {
    data: entriesData,
    isLoading: isEntriesLoading,
    refetch,
    isFetching,
  } = useGetEntriesQuery(apiDate);
  const { data: typeList, isLoading: loadingTypes } =
    useSearchEntryTypesQuery(typeSearch);
  const { data: categoryList, isLoading: loadingCategories } =
    useSearchCategoriesQuery(categorySearch);

  const entriesList = entriesData?.entries || [];

  const [createEntry, { isLoading: isCreating }] = useCreateEntryMutation();
  const [updateEntry, { isLoading: isUpdating }] = useUpdateEntryMutation();
  const [deleteEntry] = useDeleteEntryMutation();

  // --- Handlers ---
  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setAmount("");
    setDescription("");
    setSelectedTypeObj(null);
    setSelectedCategoryObj(null);
    setTypeSearch("");
    setCategorySearch("");
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setAmount(item.amount.toString());
    setDescription(item.description || "");
    setSelectedTypeObj({ label: item.entry_type, code: item.entry_type });
    setSelectedCategoryObj({ label: item.category, code: item.category });
    setModalVisible(true);
  };

  const handleTypeChange = (text) => {
    setTypeSearch(text);
    setSelectedTypeObj(null);
  };

  const handleCategoryChange = (text) => {
    setCategorySearch(text);
    setSelectedCategoryObj({
      label: text,
      code: text.toUpperCase().replace(/\s+/g, "_"),
    });
  };

  const handleSave = async () => {
    if (!amount || !selectedTypeObj || !selectedTypeObj.code) {
      toast.error("Please select a valid Type from the list");
      return;
    }

    if (!selectedCategoryObj) {
      toast.error("Category is required");
      return;
    }

    const safeType =
      selectedTypeObj.code ||
      selectedTypeObj.label?.toUpperCase().replace(/\s+/g, "_");
    const safeCategory =
      selectedCategoryObj.code ||
      selectedCategoryObj.label?.toUpperCase().replace(/\s+/g, "_");

    try {
      if (isEditing) {
        await updateEntry({
          id: editingId,
          date: apiDate,
          entry_type: safeType,
          category: safeCategory,
          amount: parseFloat(amount),
          description: description,
        }).unwrap();
        toast.success("Updated");
      } else {
        const payload = {
          date: apiDate,
          entries: [
            {
              entry_type: safeType,
              category: safeCategory,
              amount: parseFloat(amount),
              description: description,
            },
          ],
        };
        await createEntry(payload).unwrap();
        toast.success("Created");
      }
      setModalVisible(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Confirm deletion?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEntry(id)
            .unwrap()
            .then(() => toast.success("Deleted"));
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isIncome = ["SALE", "INCOME", "DEPOSIT"].includes(
      item.entry_type?.toUpperCase(),
    );
    return (
      <View style={styles.entryItem}>
        <View style={styles.entryLeft}>
          <Text style={styles.entryCategory}>{item.category}</Text>
          <View style={styles.tagRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.entry_type}</Text>
            </View>
            {item.description ? (
              <Text style={styles.entryDesc} numberOfLines={1}>
                - {item.description}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.entryRight}>
          <Text
            style={[
              styles.amountText,
              isIncome ? styles.income : styles.expense,
            ]}
          >
            {isIncome ? "+" : "-"} ₹{item.amount?.toLocaleString("en-IN")}
          </Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={styles.iconBtn}
            >
              <Edit2 size={18} color={theme.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.iconBtn}
            >
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
      <View style={styles.dateControl}>
        <TouchableOpacity
          onPress={() => setSelectedDate(subDays(selectedDate, 1))}
          style={styles.navBtn}
        >
          <ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBadge}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar color="#4ade80" size={16} style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>{displayDate}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedDate(addDays(selectedDate, 1))}
          style={styles.navBtn}
        >
          <ChevronRight color={theme.text} size={24} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}

      <FlatList
        data={entriesList}
        renderItem={renderItem}
        nestedScrollEnabled={true}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={["#2E7D32"]}
            tintColor={theme.text}
          />
        }
        ListEmptyComponent={
          !isEntriesLoading && (
            <Text style={styles.emptyText}>No entries for {displayDate}</Text>
          )
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Plus size={24} color={theme.background} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Entry" : "New Entry"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* TYPE DROPDOWN */}
              <View style={{ zIndex: 2000, marginBottom: 16 }}>
                <SearchableDropdown
                  label="Type"
                  placeholder="Select Type..."
                  data={typeList}
                  isLoading={loadingTypes}
                  selectedValue={selectedTypeObj?.label}
                  onChangeText={handleTypeChange}
                  onSelect={(item) => {
                    setSelectedTypeObj(item);
                    setTypeSearch("");
                  }}
                  nestedScrollEnabled={true}
                />
              </View>

              {/* CATEGORY DROPDOWN */}
              <View style={{ zIndex: 1000, marginBottom: 16 }}>
                <SearchableDropdown
                  label="Category"
                  placeholder="Select or Type..."
                  data={categoryList}
                  isLoading={loadingCategories}
                  selectedValue={selectedCategoryObj?.label}
                  onChangeText={handleCategoryChange}
                  onSelect={(item) => {
                    setSelectedCategoryObj(item);
                    setCategorySearch("");
                  }}
                  nestedScrollEnabled={true}
                />
              </View>

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="₹ 0.00"
                placeholderTextColor={theme.secondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional notes"
                placeholderTextColor={theme.secondary}
                value={description}
                onChangeText={setDescription}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <ActivityIndicator color={theme.background} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Entry</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background, // Zinc 950
        },

        // --- DATE CONTROLS ---
        dateControl: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 12,
          backgroundColor: theme.primary, // Zinc 900
          borderBottomWidth: 1,
          borderColor: theme.border, // Zinc 800
        },
        navBtn: { padding: 8 },
        dateBadge: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.background,
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
        },
        dateText: {
          fontSize: 15,
          fontWeight: "600",
          color: theme.text, // White
        },

        // --- ENTRY LIST ITEM ---
        entryItem: {
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor: theme.primary, // Zinc 900
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.border, // Zinc 800
        },
        entryLeft: { flex: 1 },
        entryCategory: {
          fontSize: 16,
          fontWeight: "600",
          color: theme.heading, // White
          marginBottom: 4,
        },
        tagRow: { flexDirection: "row", alignItems: "center" },
        badge: {
          backgroundColor: theme.background, // Inset look
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          marginRight: 8,
          borderWidth: 1,
          borderColor: theme.border,
        },
        badgeText: {
          fontSize: 12,
          fontWeight: "500",
          color: theme.secondary, // Muted
        },
        entryDesc: {
          fontSize: 12,
          color: theme.secondary,
        },
        entryRight: {
          alignItems: "flex-end",
          justifyContent: "space-between",
        },
        amountText: {
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 8,
        },
        actionRow: { flexDirection: "row", gap: 12 },
        iconBtn: { padding: 4 },
        income: { color: "#4ade80" }, // Green 400
        expense: { color: "#ef4444" }, // Red 500

        emptyText: {
          textAlign: "center",
          marginTop: 40,
          color: theme.secondary,
        },

        // --- FAB ---
        fab: {
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: theme.textSecondary, // White
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },

        // --- MODAL ---
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)", // Darker overlay
          justifyContent: "flex-end",
        },
        modalContent: {
          backgroundColor: theme.primary, // Zinc 900
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 24,
          maxHeight: "90%",
          borderWidth: 1,
          borderColor: theme.border,
        },
        modalHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        },
        modalTitle: {
          fontSize: 20,
          fontWeight: "bold",
          color: theme.heading, // White
        },
        label: {
          fontSize: 14,
          fontWeight: "500",
          color: theme.secondary, // Muted
          marginBottom: 6,
        },
        input: {
          borderWidth: 1,
          borderColor: theme.border, // Zinc 800
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
          color: theme.text, // White
          backgroundColor: theme.background, // Zinc 950 (Inset)
        },
        saveBtn: {
          backgroundColor: theme.textSecondary, // White
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 8,
        },
        saveBtnText: {
          color: theme.background, // Black
          fontWeight: "bold",
          fontSize: 16,
        },
      }),
    [theme],
  );
