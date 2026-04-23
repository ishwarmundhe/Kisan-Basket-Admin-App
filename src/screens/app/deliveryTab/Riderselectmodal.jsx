import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useGetRidersListQuery } from "../../../services/deliveryApi";
import { useTheme } from "../../../constant/ThemeContext";

const RiderSelectModal = ({
  visible,
  onClose,
  onSelect,
  title = "Select Rider",
  showReasonInput = false,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [search, setSearch] = useState("");
  const [selectedRider, setSelectedRider] = useState(null);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useGetRidersListQuery(undefined, {
    skip: !visible,
  });

  const filteredRiders = useMemo(() => {
    const riders = data?.riders || [];
    if (!search.trim())
      return riders.filter((r) => r.approval_status === "approved");
    const q = search.toLowerCase();
    return riders.filter(
      (r) =>
        r.approval_status === "approved" &&
        (r.full_name?.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.email?.toLowerCase().includes(q)),
    );
  }, [data, search]);

  const handleConfirm = () => {
    if (!selectedRider) return;
    onSelect(selectedRider, reason.trim());
    // reset
    setSearch("");
    setSelectedRider(null);
    setReason("");
  };

  const handleClose = () => {
    setSearch("");
    setSelectedRider(null);
    setReason("");
    onClose();
  };

  const renderRider = ({ item }) => {
    const isChosen = selectedRider?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.riderRow, isChosen && styles.riderRowSelected]}
        onPress={() => setSelectedRider(item)}
        activeOpacity={0.7}
      >
        {/* Avatar circle */}
        <View style={[styles.avatar, isChosen && styles.avatarSelected]}>
          <Text
            style={[styles.avatarText, isChosen && styles.avatarTextSelected]}
          >
            {(item.full_name || "?").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.riderMeta}>
          <Text
            style={[styles.riderName, isChosen && styles.riderNameSelected]}
          >
            {item.full_name || "Unknown"}
          </Text>
          <Text style={styles.riderPhone}>{item.phone}</Text>
        </View>

        {/* Delivery count pill */}
        <View style={styles.deliveryPill}>
          <Text style={styles.deliveryPillText}>
            {item.total_deliveries ?? 0} done
          </Text>
        </View>

        {isChosen && (
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or phone..."
                placeholderTextColor={theme.secondary}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Text style={styles.clearSearch}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Rider list */}
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color={theme.textSecondary} />
              </View>
            ) : (
              <FlatList
                data={filteredRiders}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderRider}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 8,
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <Text style={styles.emptyMsg}>No approved riders found</Text>
                }
              />
            )}

            {/* Reason input for reassignments */}
            {showReasonInput && (
              <View style={styles.reasonBox}>
                <Text style={styles.reasonLabel}>Reason for reassignment</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g. Previous rider fell sick"
                  placeholderTextColor={theme.secondary}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}

            {/* Footer actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  !selectedRider && styles.confirmBtnDisabled,
                  {
                    backgroundColor: selectedRider
                      ? theme.textSecondary
                      : theme.border,
                  },
                ]}
                onPress={handleConfirm}
                disabled={!selectedRider}
              >
                <Text style={styles.confirmText}>
                  {showReasonInput ? "Reassign" : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const useStyles = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        },
        sheet: {
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: "78%",
          paddingTop: 8,
        },
        handle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.border,
          alignSelf: "center",
          marginBottom: 12,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTitle: {
          fontSize: 17,
          fontWeight: "700",
          color: theme.heading,
        },
        closeBtn: {
          padding: 4,
        },
        closeX: {
          fontSize: 16,
          color: theme.secondary,
        },
        searchWrapper: {
          flexDirection: "row",
          alignItems: "center",
          margin: 16,
          paddingHorizontal: 12,
          backgroundColor: theme.primary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          height: 46,
        },
        searchIcon: {
          fontSize: 16,
          marginRight: 8,
        },
        searchInput: {
          flex: 1,
          color: theme.text,
          fontSize: 14,
        },
        clearSearch: {
          color: theme.secondary,
          fontSize: 14,
          paddingLeft: 8,
        },
        loadingBox: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        emptyMsg: {
          textAlign: "center",
          color: theme.secondary,
          marginTop: 32,
          fontSize: 14,
        },
        riderRow: {
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
        },
        riderRowSelected: {
          borderColor: theme.textSecondary,
          backgroundColor: `${theme.textSecondary}12`,
        },
        avatar: {
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: theme.border,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        },
        avatarSelected: {
          backgroundColor: theme.secondary,
        },
        avatarText: {
          fontSize: 16,
          fontWeight: "700",
          color: theme.secondary,
        },
        avatarTextSelected: {
          color: theme.background,
        },
        riderMeta: {
          flex: 1,
        },
        riderName: {
          fontSize: 15,
          fontWeight: "600",
          color: theme.heading,
        },
        riderNameSelected: {
          color: theme.textSecondary,
        },
        riderPhone: {
          fontSize: 12,
          color: theme.secondary,
          marginTop: 2,
        },
        deliveryPill: {
          backgroundColor: theme.border,
          borderRadius: 10,
          paddingHorizontal: 8,
          paddingVertical: 3,

          marginRight: 8,
        },
        deliveryPillText: {
          fontSize: 11,
          color: theme.secondary,
        },
        checkCircle: {
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: theme.textSecondary,
          justifyContent: "center",
          alignItems: "center",
        },
        checkMark: {
          fontSize: 12,
          fontWeight: "700",
        },
        reasonBox: {
          marginHorizontal: 16,
          marginBottom: 8,
        },
        reasonLabel: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 6,
        },
        reasonInput: {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: theme.text,
          fontSize: 14,
          minHeight: 60,
          textAlignVertical: "top",
        },
        footer: {
          flexDirection: "row",
          gap: 12,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        },
        cancelBtn: {
          flex: 1,
          paddingVertical: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: "center",
        },
        cancelText: {
          fontSize: 15,
          fontWeight: "600",
          color: theme.secondary,
        },
        confirmBtn: {
          flex: 2,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        },
        confirmBtnDisabled: {
          opacity: 0.5,
        },
        confirmText: {
          fontSize: 15,
          fontWeight: "700",
        },
      }),
    [theme],
  );

export default RiderSelectModal;
