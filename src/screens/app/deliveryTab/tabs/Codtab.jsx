import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../../../constant/ThemeContext";
import {
  useAllCODCollectionQuery,
  usePendingDepositQuery,
  useViewDepositDetailsQuery,
  useGetRidersListQuery,
  useFilterCODRidersQuery,
  useCodDepositMutation,
  useVerifyCODDepositMutation,
} from "../../../../services/deliveryApi";

import { toast } from "sonner-native";

const SUB_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending Deposit" },
  { key: "deposited", label: "Awaiting Verify" },
];

const STATUS_CONFIG = {
  collected: {
    bg: "rgba(234,179,8,0.12)",
    text: "#d97706",
    label: "Collected",
  },
  deposited: {
    bg: "rgba(59,130,246,0.12)",
    text: "#3b82f6",
    label: "Deposited",
  },
  verified: { bg: "rgba(34,197,94,0.12)", text: "#16a34a", label: "Verified" },
};

const DepositModal = ({ visible, onClose, onConfirm, isLoading }) => {
  const { theme } = useTheme();
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm(notes.trim());
    setNotes("");
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <Modal
      visible={false}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={dmStyles.overlay} onPress={handleClose}>
        <Pressable
          style={[
            dmStyles.dialog,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[dmStyles.title, { color: theme.heading }]}>
            Mark as Deposited
          </Text>
          <Text style={[dmStyles.subtitle, { color: theme.secondary }]}>
            Confirm that cash has been collected at the office
          </Text>

          <Text style={[dmStyles.label, { color: theme.text }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              dmStyles.input,
              {
                backgroundColor: theme.primary,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="e.g. Received by Priya, accounts team"
            placeholderTextColor={theme.secondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={dmStyles.actions}>
            <TouchableOpacity
              style={[
                dmStyles.btn,
                { borderColor: theme.border, borderWidth: 1 },
              ]}
              onPress={handleClose}
            >
              <Text style={{ color: theme.secondary, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dmStyles.btn,
                dmStyles.confirmBtn,
                { backgroundColor: theme.textSecondary },
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={{ color: theme.background, fontWeight: "700" }}>
                  Confirm Deposit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const dmStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  title: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    marginBottom: 16,
  },
  actions: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtn: {},
});

const CODCard = ({ item, theme, onDeposit, onVerify }) => {
  const styles = useCardStyles(theme);
  const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.collected;

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const isCollected = item.status === "collected";
  const isDeposited = item.status === "deposited";

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
          <Text style={styles.riderName}>Rider: {item.rider}</Text>
          <Text style={styles.riderPhone}>{item.rider_phone}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            ₹{parseFloat(item.amount ?? 0).toFixed(2)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>
              {cfg.label}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.timeline}>
        <TimelineRow label="Collected" value={formatDate(item.collected_at)} />
        {item.deposited_at && (
          <TimelineRow
            label="Deposited"
            value={formatDate(item.deposited_at)}
          />
        )}
        {item.verified_at && (
          <TimelineRow label="Verified" value={formatDate(item.verified_at)} />
        )}
      </View>

      {(isCollected || isDeposited) && (
        <View style={styles.actionsRow}>
          {isCollected && (
            <View style={[styles.actionBtn, { backgroundColor: cfg.bg }]}>
              <Text style={{ color: cfg.text, fontWeight: "600" }}>
                Deposit Collection Pending
              </Text>
            </View>
          )}
          {isDeposited && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#16a34a" }]}
              onPress={() => onVerify(item)}
            >
              <Text style={styles.actionBtnText}>Verify Deposit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const TimelineRow = ({ label, value }) => (
  <View style={{ flexDirection: "row", marginBottom: 2 }}>
    <Text style={{ fontSize: 11, color: "#9ca3af", width: 66 }}>{label}</Text>
    <Text style={{ fontSize: 11, color: "#6b7280" }}>{value}</Text>
  </View>
);

const useCardStyles = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.primary,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 14,
          marginBottom: 12,
          shadowcolor: theme.background,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        },
        headerRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        },
        orderNumber: { fontSize: 16, fontWeight: "700", color: theme.heading },
        riderName: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.text,
          marginTop: 2,
        },
        riderPhone: { fontSize: 12, color: theme.secondary },
        right: { alignItems: "flex-end" },
        amount: { fontSize: 18, fontWeight: "700", color: theme.heading },
        statusBadge: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
          marginTop: 4,
        },
        statusText: { fontSize: 11, fontWeight: "600" },
        timeline: {
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 10,
          marginBottom: 10,
        },
        actionsRow: {
          flexDirection: "row",
          gap: 10,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 10,
        },
        actionBtn: {
          flex: 1,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
        },
        actionBtnText: {
          color: theme.background,
          fontSize: 13,
          fontWeight: "600",
        },
      }),
    [theme],
  );

const CODTab = () => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [activeSubTab, setActiveSubTab] = useState("all");
  const [selectedRiderId, setSelectedRiderId] = useState(null);
  const [riderPickerVisible, setRiderPickerVisible] = useState(false);
  const [riderSearch, setRiderSearch] = useState(""); // Search state for riders

  const [depositModal, setDepositModal] = useState({
    visible: false,
    item: null,
  });

  const {
    data: allData,
    isLoading: allLoading,
    refetch: refetchAll,
  } = useAllCODCollectionQuery(undefined, { skip: activeSubTab !== "all" });
  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = usePendingDepositQuery(undefined, { skip: activeSubTab !== "pending" });
  const {
    data: depositedData,
    isLoading: depositedLoading,
    refetch: refetchDeposited,
  } = useViewDepositDetailsQuery(undefined, {
    skip: activeSubTab !== "deposited",
  });
  const { data: ridersData } = useGetRidersListQuery();
  const {
    data: filteredData,
    isLoading: filterLoading,
    refetch: refetchFiltered,
  } = useFilterCODRidersQuery(
    { rider_id: selectedRiderId },
    { skip: !selectedRiderId },
  );

  const [codDeposit, { isLoading: isDepositing }] = useCodDepositMutation();
  const [verifyDeposit, { isLoading: isVerifying }] =
    useVerifyCODDepositMutation();

  const isLoading =
    allLoading || pendingLoading || depositedLoading || filterLoading;

  const collections = useMemo(() => {
    if (selectedRiderId) return filteredData?.collections ?? [];
    if (activeSubTab === "pending") return pendingData?.collections ?? [];
    if (activeSubTab === "deposited") return depositedData?.collections ?? [];
    return allData?.collections ?? [];
  }, [
    activeSubTab,
    allData,
    pendingData,
    depositedData,
    filteredData,
    selectedRiderId,
  ]);

  const refetchCurrent = () => {
    if (selectedRiderId) {
      refetchFiltered?.();
      return;
    }
    if (activeSubTab === "pending") refetchPending?.();
    else if (activeSubTab === "deposited") refetchDeposited?.();
    else refetchAll?.();
  };

  const handleDeposit = (item) => {
    setDepositModal({ visible: true, item });
  };

  const handleDepositConfirm = async (notes) => {
    const { item } = depositModal;

    try {
      await codDeposit({
        orderId: item.id,
        body: { notes },
      }).unwrap();

      setDepositModal({ visible: false, item: null });
      toast.success("Success", { description: "Deposit recorded" });
      refetchCurrent();
    } catch (err) {
      toast.error("Error", { description: err?.data?.message || "Failed" });
    }
  };

  const handleVerify = (item) => {
    Alert.alert(
      "Verify Deposit",
      `Confirm ₹${parseFloat(item.amount).toFixed(2)} from ${item.rider} for Order #${item.order_number}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: async () => {
            try {
              await verifyDeposit({
                orderId: item.id,
                body: {},
              }).unwrap();
              toast.success("Success", { description: "Deposit verified" });
              refetchCurrent();
            } catch (err) {
              toast.error("Error", {
                description: err?.data?.message ?? "Verification failed",
              });
            }
          },
        },
      ],
    );
  };

  const approvedRiders = useMemo(
    () =>
      (ridersData?.riders ?? []).filter(
        (r) => r.approval_status === "approved",
      ),
    [ridersData],
  );

  const filteredRiders = useMemo(() => {
    if (!riderSearch.trim()) return approvedRiders;
    const query = riderSearch.toLowerCase();
    return approvedRiders.filter(
      (r) =>
        r.full_name?.toLowerCase().includes(query) ||
        r.phone?.toLowerCase().includes(query),
    );
  }, [approvedRiders, riderSearch]);

  const selectedRider = useMemo(
    () => approvedRiders.find((r) => r.id === selectedRiderId),
    [approvedRiders, selectedRiderId],
  );

  const closeRiderPicker = () => {
    setRiderPickerVisible(false);
    setRiderSearch("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.subTabRow}>
        {SUB_TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.subTab,
              activeSubTab === t.key && styles.subTabActive,
            ]}
            onPress={() => {
              setActiveSubTab(t.key);
              setSelectedRiderId(null);
            }}
          >
            <Text
              style={[
                styles.subTabText,
                activeSubTab === t.key
                  ? { color: theme.textSecondary }
                  : { color: theme.secondary },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.riderFilter,
            {
              borderColor: selectedRiderId ? theme.textSecondary : theme.border,
            },
          ]}
          onPress={() => setRiderPickerVisible(true)}
        >
          <Text
            style={{
              fontSize: 13,
              color: selectedRiderId ? theme.textSecondary : theme.secondary,
            }}
          >
            {selectedRider ? `${selectedRider.full_name}` : "Filter by rider"}
          </Text>
          <Text style={{ color: theme.secondary }}> ▾</Text>
        </TouchableOpacity>
        {selectedRiderId && (
          <TouchableOpacity
            style={styles.clearFilter}
            onPress={() => setSelectedRiderId(null)}
          >
            <Text style={{ color: theme.secondary, fontSize: 12 }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.textSecondary} />
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => (
            <CODCard
              item={item}
              theme={theme}
              onDeposit={handleDeposit}
              onVerify={handleVerify}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: theme.secondary, marginTop: 8 }}>
                No records found
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetchCurrent}
              tintColor={theme.textSecondary}
            />
          }
        />
      )}

      <Modal
        visible={riderPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={closeRiderPicker}
      >
        <Pressable style={styles.pickerOverlay} onPress={closeRiderPicker}>
          <Pressable
            style={[styles.pickerSheet, { backgroundColor: theme.background }]}
            onPress={() => {}}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, width: "100%" }}
            >
              <View style={styles.pickerHandle} />

              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: theme.heading }]}>
                  Filter by Rider
                </Text>
                <TouchableOpacity
                  onPress={closeRiderPicker}
                  style={styles.closeBtn}
                >
                  <Text style={{ fontSize: 18, color: theme.secondary }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
              {/* search */}
              <View
                style={[
                  styles.searchWrapper,
                  { backgroundColor: theme.primary, borderColor: theme.border },
                ]}
              >
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Search by name or phone..."
                  placeholderTextColor={theme.secondary}
                  value={riderSearch}
                  onChangeText={setRiderSearch}
                  autoCorrect={false}
                />
                {riderSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setRiderSearch("")}>
                    <Text style={{ color: theme.secondary, fontSize: 16 }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={filteredRiders}
                keyExtractor={(r) => r.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerRow,
                      { borderBottomColor: theme.border },
                      item.id === selectedRiderId && {
                        backgroundColor: `${theme.textSecondary}12`,
                      },
                    ]}
                    onPress={() => {
                      setSelectedRiderId(item.id);
                      closeRiderPicker();
                    }}
                  >
                    <View
                      style={[
                        styles.pickerAvatar,
                        { backgroundColor: theme.border },
                      ]}
                    >
                      <Text
                        style={{ fontWeight: "700", color: theme.secondary }}
                      >
                        {(item.full_name || "?")[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "600", color: theme.heading }}>
                        {item.full_name}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.secondary }}>
                        {item.phone}
                      </Text>
                    </View>
                    {item.id === selectedRiderId && (
                      <Text
                        style={{
                          color: theme.textSecondary,
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      color: theme.secondary,
                      textAlign: "center",
                      padding: 20,
                    }}
                  >
                    No riders found
                  </Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>

      <DepositModal
        visible={depositModal.visible}
        onClose={() => setDepositModal({ visible: false, item: null })}
        onConfirm={handleDepositConfirm}
        isLoading={isDepositing}
      />
    </View>
  );
};

const useStyles = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        centered: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        },
        subTabRow: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.primary,
        },
        subTab: {
          flex: 1,
          paddingVertical: 12,
          alignItems: "center",
        },
        subTabActive: {
          borderBottomWidth: 2,
          borderBottomColor: theme.textSecondary,
        },
        subTabText: { fontSize: 12, fontWeight: "600" },

        filterRow: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        },
        riderFilter: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
          backgroundColor: theme.primary,
        },
        clearFilter: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.primary,
        },

        summaryScroll: { marginBottom: 4, maxHeight: 110 },

        list: { padding: 16, paddingTop: 4, paddingBottom: 40 },

        pickerOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        },
        pickerSheet: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: "65%",
          paddingTop: 8,
          overflow: "hidden",
        },
        pickerHandle: {
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.border,
          alignSelf: "center",
          marginBottom: 14,
        },
        pickerHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          marginBottom: 10,
        },
        pickerTitle: {
          fontSize: 16,
          fontWeight: "700",
        },
        closeBtn: {
          padding: 4,
        },
        searchWrapper: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 10,
          marginHorizontal: 16,
          marginBottom: 12,
          paddingHorizontal: 10,
          height: 40,
        },
        searchIcon: {
          fontSize: 16,
          marginRight: 8,
        },
        searchInput: {
          flex: 1,
          fontSize: 14,
          height: "100%",
        },
        pickerRow: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 13,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
        },
        pickerAvatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        },
      }),
    [theme],
  );

export default CODTab;
