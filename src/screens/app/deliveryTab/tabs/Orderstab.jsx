import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FAB } from "react-native-paper";
import { toast } from "sonner-native";
import { useTheme } from "../../../../constant/ThemeContext";
import RiderSelectModal from "../Riderselectmodal";
import {
  useAssignSingleOrderMutation,
  useAssignBulkOrderMutation,
  useUpdateSingleOrderAssignmentMutation,
  useOrderListQuery,
  useRegisterDeliverPersonMutation,
} from "../../../../services/deliveryApi";
import { Bike } from "lucide-react-native";
import { WAREHOUSE_LIST, GET_CHANNELS } from "../../../../graphql/Query";
import { useQuery } from "@apollo/client/react";
import DateTimePicker from "@react-native-community/datetimepicker";

const STATUS_CONFIG = {
  UNCONFIRMED: {
    bg: "rgba(234,179,8,0.12)",
    text: "#d97706",
    label: "Unconfirmed",
  },
  UNFULFILLED: {
    bg: "rgba(59,130,246,0.12)",
    text: "#3b82f6",
    label: "Unfulfilled",
  },
  FULFILLED: {
    bg: "rgba(34,197,94,0.12)",
    text: "#16a34a",
    label: "Fulfilled",
  },
  PARTIALLY_FULFILLED: {
    bg: "rgba(234,179,8,0.12)",
    text: "#ca8a04",
    label: "Partial",
  },
  CANCELED: { bg: "rgba(239,68,68,0.12)", text: "#dc2626", label: "Cancelled" },
  RETURNED: {
    bg: "rgba(107,114,128,0.12)",
    text: "#6b7280",
    label: "Returned",
  },
};

const getStatusCfg = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] ?? {
    bg: "rgba(107,114,128,0.1)",
    text: "#6b7280",
    label: status ?? "—",
  };

const PAGE_SIZE = 50;

const OrdersTab = ({ date }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [newRiderInfo, setNewRiderInfo] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    title: "Assign Rider",
    isBulk: false,
    singleOrderId: null,
    reassignInfo: null,
  });
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    secondary_phone: "",
    email: "",
    address: "",
    warehouse_id: "",
    channel_id: "",
  });
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(date ?? new Date());
  const [showPicker, setShowPicker] = useState(false);

  const formattedFilterDate = useMemo(
    () => selectedDate.toLocaleDateString("en-CA"),
    [selectedDate],
  );

  const {
    data: orderlist,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useOrderListQuery({
    date: formattedFilterDate,
    q: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: warehouseList } = useQuery(WAREHOUSE_LIST);
  const { data: channelList } = useQuery(GET_CHANNELS);

  const channels = channelList?.publicChannels || [];
  const warehouses =
    warehouseList?.warehouses?.edges?.map((edge) => edge.node) || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [formattedFilterDate]);

  useEffect(() => {
    if (!orderlist?.orders) return;

    if (page === 1) {
      setAllOrders(orderlist.orders);
    } else {
      setAllOrders((prev) => {
        const map = new Map(prev.map((o) => [o.order_id, o]));
        orderlist.orders.forEach((o) => map.set(o.order_id, o));
        return Array.from(map.values());
      });
    }

    setHasMore(orderlist.orders.length === PAGE_SIZE);
  }, [orderlist]);

  const orders = useMemo(() => orderlist?.orders || [], [orderlist]);

  const [registerRider, { isLoading: isRegistering }] =
    useRegisterDeliverPersonMutation();
  const [assignSingle, { isLoading: isAssigningSingle }] =
    useAssignSingleOrderMutation();
  const [assignBulk, { isLoading: isAssigningBulk }] =
    useAssignBulkOrderMutation();
  const [updateAssignment, { isLoading: isReassigning }] =
    useUpdateSingleOrderAssignmentMutation();

  const isSubmitting = isAssigningSingle || isAssigningBulk || isReassigning;

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch?.();
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = () => setSelectedIds(new Set());
  const selectAll = () =>
    setSelectedIds(new Set(orders.map((o) => o.order_id)));

  const openSingleAssign = useCallback((order) => {
    setModalConfig({
      title: `Assign #${order.order_number}`,
      isBulk: false,
      singleOrderId: order.order_id,
      reassignInfo: null,
    });
    setModalVisible(true);
  }, []);

  const openBulkAssign = () => {
    setModalConfig({
      title: `Assign ${selectedIds.size} Orders`,
      isBulk: true,
      singleOrderId: null,
      reassignInfo: null,
    });
    setModalVisible(true);
  };

  const openReassign = useCallback((order, assignmentId) => {
    setModalConfig({
      title: `Reassign #${order.order_number}`,
      isBulk: false,
      singleOrderId: null,
      reassignInfo: { assignmentId },
    });
    setModalVisible(true);
  }, []);

  const handleRiderSelected = (rider, reason = "") => {
    setModalVisible(false);
    setPendingAssignment({ rider, reason });
    setDeliveryFee("");
    setTimeout(() => setFeeModalVisible(true), 300);
  };

  const handleConfirmAssignment = async () => {
    setFeeModalVisible(false);
    if (!pendingAssignment) return;

    const { rider, reason } = pendingAssignment;
    const { isBulk, singleOrderId, reassignInfo } = modalConfig;
    const finalFee = deliveryFee.trim() !== "" ? parseFloat(deliveryFee) : 0;

    try {
      if (isBulk) {
        await assignBulk({
          order_ids: Array.from(selectedIds),
          rider_id: rider.id,
          requires_otp: false,
          notes: reason || undefined,
          delivery_fee: finalFee,
        }).unwrap();
        clearSelection();
        toast.success("Assigned", {
          description: `${selectedIds.size} orders assigned to ${rider.full_name}`,
        });
      } else if (reassignInfo) {
        if (!reassignInfo.assignmentId) {
          toast.error("Error: Missing Assignment ID from backend.");
          setPendingAssignment(null);
          return;
        }
        await updateAssignment({
          orderId: reassignInfo.assignmentId,
          body: {
            rider_id: rider.id,
            reason: reason || "Reassigned by staff",
            delivery_fee: finalFee,
          },
        }).unwrap();
        toast.success("Reassigned", {
          description: `Order reassigned to ${rider.full_name}`,
        });
      } else if (singleOrderId) {
        await assignSingle({
          order_id: singleOrderId,
          rider_id: rider.id,
          requires_otp: false,
          notes: reason || undefined,
          delivery_fee: finalFee,
        }).unwrap();
        toast.success("Assigned", {
          description: `Order assigned to ${rider.full_name}`,
        });
      }
      handleRefresh();
    } catch (err) {
      const msg =
        err?.data?.message ??
        err?.data?.detail ??
        "Assignment failed. Please try again.";
      toast.error("Error", { description: msg });
    } finally {
      setPendingAssignment(null);
    }
  };

  const handleRegisterSubmit = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone ||
      !formData.channel_id ||
      !formData.warehouse_id
    ) {
      toast.error("Missing Fields", {
        description:
          "First name, last name, phone, channel, and warehouse are required.",
      });
      return;
    }

    try {
      const response = await registerRider({ body: formData }).unwrap();
      setNewRiderInfo(response);
      setRegisterModalVisible(false);
      setSuccessModalVisible(true);
      toast.success("Success", {
        description: "Delivery person registered successfully!",
      });
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        secondary_phone: "",
        email: "",
        address: "",
        channel_id: "",
        warehouse_id: "",
      });
    } catch (err) {
      const msg =
        err?.data?.message ??
        err?.data?.detail ??
        "Registration failed. Please try again.";
      toast.error("Registration Error", { description: msg });
    }
  };

  const handleShareCredentials = async () => {
    if (!newRiderInfo) return;
    const shareMessage = `Kisanbasket Delivery App Login Details\n\nName: ${newRiderInfo.rider.full_name}\nPhone: ${newRiderInfo.phone}\n${newRiderInfo.email ? `Email: ${newRiderInfo.email}\n` : ""}Password: ${newRiderInfo.temp_password}\n\n${newRiderInfo.message}`;
    try {
      await Share.share({ message: shareMessage });
    } catch {
      toast.error("Error", { description: "Failed to share credentials." });
    }
  };

  const renderOrder = useCallback(
    ({ item }) => {
      const isSelected = selectedIds.has(item.order_id);
      const addr = item.shipping_address ?? {};
      const statusCfg = getStatusCfg(item.order_status);
      const isCOD = item.payment_status === "unpaid";
      const assignment = item.assignment ?? null;
      const riderName =
        assignment?.rider?.full_name || assignment?.rider_name || "Assigned";

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.card, isSelected && styles.cardSelected]}
          onLongPress={() => toggleSelect(item.order_id)}
          onPress={() => selectedIds.size > 0 && toggleSelect(item.order_id)}
        >
          {isSelected && <View style={styles.selectedStrip} />}
          <View style={styles.cardInner}>
            <TouchableOpacity
              style={[styles.checkbox, isSelected && styles.checkboxChecked]}
              onPress={() => toggleSelect(item.order_id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.orderContent}>
              <View style={styles.row}>
                <Text style={styles.orderNum}>#{item.order_number}</Text>
                <View style={styles.badges}>
                  {isCOD && (
                    <View style={styles.codBadge}>
                      <Text style={styles.codBadgeText}>COD</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusCfg.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusCfg.text }]}
                    >
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.primaryAddress} numberOfLines={2}>
                {addr.street_address_1 || "No address provided"}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.secondaryCustomerInfo}>
                  {item.customer_name || "Unknown"} •{" "}
                  {item.customer_phone || "—"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.amount}>
                  {item.currency === "INR" ? "₹" : item.currency}{" "}
                  {parseFloat(item.total ?? 0).toFixed(2)}
                </Text>
                {item.delivery_slot ? (
                  <Text style={styles.slot}>{item.delivery_slot}</Text>
                ) : null}
              </View>

              <View style={styles.divider} />

              {assignment ? (
                <View style={styles.assignedRow}>
                  <View style={styles.assignedBadge}>
                    <View style={styles.assign}>
                      <Bike size={15} color={theme.success ?? "#16a34a"} />
                      <Text
                        style={styles.assignedRiderText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {riderName}
                      </Text>
                    </View>
                    {assignment.delivery_fee && (
                      <Text style={styles.feeText}>
                        Fee: ₹{parseFloat(assignment.delivery_fee).toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reassignBtn]}
                    onPress={() => openReassign(item, assignment.assignment_id)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Reassign
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.assignBtn,
                    { backgroundColor: theme.textSecondary },
                  ]}
                  onPress={() => openSingleAssign(item)}
                  disabled={isSubmitting}
                >
                  <Text style={{ color: "#000", fontWeight: "600" }}>
                    Assign Rider
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectedIds,
      theme,
      isSubmitting,
      openSingleAssign,
      openReassign,
      toggleSelect,
    ],
  );

  const ListFooter = () => {
    if (!isFetching || page === 1) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={theme.textSecondary} />
      </View>
    );
  };

  if (loading && page === 1 && allOrders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.textSecondary} />
        <Text style={styles.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load orders</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.textSecondary }]}
          onPress={handleRefresh}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.dateHeader, { borderBottomColor: theme.border }]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={theme.textSecondary}
        />
        <Text style={[styles.dateText, { color: theme.heading }]}>
          {selectedDate.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Ionicons name="chevron-down" size={16} color={theme.secondary} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(_event, picked) => {
            setShowPicker(false);
            if (picked) {
              setSelectedDate(picked);
            }
          }}
        />
      )}

      {selectedIds.size > 0 && (
        <View
          style={[styles.bulkBar, { backgroundColor: theme.backgroundColor }]}
        >
          <Text style={styles.bulkCount}>{selectedIds.size} selected</Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={styles.bulkClearBtn}
              onPress={clearSelection}
            >
              <Text style={styles.bulkClearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkAssignBtn, { backgroundColor: "#0000" }]}
              onPress={openBulkAssign}
              disabled={isSubmitting}
            >
              <Text
                style={[styles.bulkAssignText, { color: theme.textSecondary }]}
              >
                Assign All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={allOrders}
        keyExtractor={(item) => String(item.order_id)}
        renderItem={renderOrder}
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {allOrders.length} order{allOrders.length !== 1 ? "s" : ""}
              </Text>
              {allOrders.length > 0 && (
                <TouchableOpacity
                  onPress={
                    selectedIds.size === orders.length
                      ? clearSelection
                      : selectAll
                  }
                >
                  <Text
                    style={[
                      styles.selectAllText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {selectedIds.size === orders.length
                      ? "Deselect all"
                      : "Select all"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholderTextColor="#A9A9A9"
                placeholder="Search order"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        }
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={handleRefresh}
            tintColor={theme.textSecondary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <RiderSelectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleRiderSelected}
        title={modalConfig.title}
        showReasonInput={!!modalConfig.reassignInfo}
      />

      <FAB
        icon="account-plus-outline"
        style={styles.fab}
        size="medium"
        onPress={() => setRegisterModalVisible(true)}
        color="white"
      />

      {/* Delivery Fee Modal */}
      <Modal
        visible={feeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feeModalContainer}>
            <Text style={styles.feeTitle}>Set Delivery Fee (Optional)</Text>
            <Text style={styles.feeSubtitle}>
              Assigning to: {pendingAssignment?.rider?.full_name}
            </Text>
            <TextInput
              style={styles.feeInput}
              placeholder="e.g 50"
              placeholderTextColor={theme.secondary}
              keyboardType="numeric"
              value={deliveryFee}
              onChangeText={setDeliveryFee}
            />
            <View style={styles.feeButtonsRow}>
              <TouchableOpacity
                style={styles.feeCancelBtn}
                onPress={() => {
                  setFeeModalVisible(false);
                  setPendingAssignment(null);
                }}
              >
                <Text style={[styles.feeBtnText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feeConfirmBtn,
                  { backgroundColor: theme.textSecondary },
                ]}
                onPress={handleConfirmAssignment}
              >
                <Text style={[styles.feeBtnText, { color: "#000" }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Register Rider Modal */}
      <Modal
        visible={registerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRegisterModalVisible(false)}
      >
        <Pressable
          style={styles.pickerOverlay}
          onPress={() => setRegisterModalVisible(false)}
        >
          <Pressable
            style={[
              styles.pickerSheet,
              { backgroundColor: theme.background, height: "85%" },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
              <View style={styles.pickerHandle} />
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: theme.heading }]}>
                  Register Delivery Person
                </Text>
                <TouchableOpacity
                  onPress={() => setRegisterModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={{ fontSize: 18, color: theme.secondary }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: Platform.OS === "ios" ? 60 : 40,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {[
                  {
                    label: "First Name *",
                    key: "first_name",
                    placeholder: "e.g. Suresh",
                  },
                  {
                    label: "Last Name *",
                    key: "last_name",
                    placeholder: "e.g. Kumar",
                  },
                ].map(({ label, key, placeholder }) => (
                  <React.Fragment key={key}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>
                      {label}
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder={placeholder}
                      placeholderTextColor={theme.secondary}
                      value={formData[key]}
                      onChangeText={(val) =>
                        setFormData({ ...formData, [key]: val })
                      }
                    />
                  </React.Fragment>
                ))}

                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Phone Number *
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 9988776655"
                  placeholderTextColor={theme.secondary}
                  keyboardType="phone-pad"
                  value={formData.phone}
                  maxLength={10}
                  onChangeText={(val) =>
                    setFormData({ ...formData, phone: val })
                  }
                />

                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Secondary Phone (Optional)
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 9988770000"
                  placeholderTextColor={theme.secondary}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.secondary_phone}
                  onChangeText={(val) =>
                    setFormData({ ...formData, secondary_phone: val })
                  }
                />

                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Email (Optional)
                </Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. suresh@example.com"
                  placeholderTextColor={theme.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) =>
                    setFormData({ ...formData, email: val })
                  }
                />

                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Address
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { height: 80, textAlignVertical: "top" },
                  ]}
                  placeholder="e.g. 456, FC Road, Pune"
                  placeholderTextColor={theme.secondary}
                  multiline
                  value={formData.address}
                  onChangeText={(val) =>
                    setFormData({ ...formData, address: val })
                  }
                />

                {/* Channel Dropdown */}
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Channel *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.formInput,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => {
                    setShowChannelDropdown(!showChannelDropdown);
                    setShowWarehouseDropdown(false);
                  }}
                >
                  <Text
                    style={{
                      color: formData.channel_id ? theme.text : theme.secondary,
                    }}
                  >
                    {channels.find((c) => c.id === formData.channel_id)?.name ||
                      "Select Channel"}
                  </Text>
                  <Ionicons
                    name={showChannelDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.secondary}
                  />
                </TouchableOpacity>
                {showChannelDropdown && (
                  <View
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderRadius: 10,
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    {channels.map((channel, index) => (
                      <TouchableOpacity
                        key={channel.id}
                        style={{
                          padding: 14,
                          borderBottomWidth:
                            index === channels.length - 1 ? 0 : 1,
                          borderBottomColor: theme.border,
                        }}
                        onPress={() => {
                          setFormData({ ...formData, channel_id: channel.id });
                          setShowChannelDropdown(false);
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 15 }}>
                          {channel.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Warehouse Dropdown */}
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  Warehouse *
                </Text>
                <TouchableOpacity
                  style={[
                    styles.formInput,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => {
                    setShowWarehouseDropdown(!showWarehouseDropdown);
                    setShowChannelDropdown(false);
                  }}
                >
                  <Text
                    style={{
                      color: formData.warehouse_id
                        ? theme.text
                        : theme.secondary,
                    }}
                  >
                    {warehouses.find((w) => w.id === formData.warehouse_id)
                      ?.name || "Select Warehouse"}
                  </Text>
                  <Ionicons
                    name={showWarehouseDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.secondary}
                  />
                </TouchableOpacity>
                {showWarehouseDropdown && (
                  <View
                    style={{
                      backgroundColor: theme.primary,
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderRadius: 10,
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    {warehouses.map((warehouse, index) => (
                      <TouchableOpacity
                        key={warehouse.id}
                        style={{
                          padding: 14,
                          borderBottomWidth:
                            index === warehouses.length - 1 ? 0 : 1,
                          borderBottomColor: theme.border,
                        }}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            warehouse_id: warehouse.id,
                          });
                          setShowWarehouseDropdown(false);
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 15 }}>
                          {warehouse.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.feeConfirmBtn,
                    {
                      backgroundColor: theme.textSecondary,
                      marginTop: 10,
                      marginBottom: 16,
                    },
                  ]}
                  onPress={handleRegisterSubmit}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={[styles.feeBtnText, { color: "#000" }]}>
                      Register Person
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feeModalContainer}>
            <Text style={styles.feeTitle}>Registration Successful! 🎉</Text>
            <Text style={styles.feeSubtitle}>
              Please screenshot or share these login details with the rider.
            </Text>
            {newRiderInfo && (
              <View style={styles.credentialsBox}>
                <Text style={styles.credLabel}>
                  Name:{" "}
                  <Text style={styles.credValue}>
                    {newRiderInfo.rider.full_name}
                  </Text>
                </Text>
                <Text style={styles.credLabel}>
                  Phone:{" "}
                  <Text style={styles.credValue}>{newRiderInfo.phone}</Text>
                </Text>
                {newRiderInfo.email ? (
                  <Text style={styles.credLabel}>
                    Email:{" "}
                    <Text style={styles.credValue}>{newRiderInfo.email}</Text>
                  </Text>
                ) : null}
                <Text style={styles.credLabel}>
                  Password:{" "}
                  <Text style={styles.credValue}>
                    {newRiderInfo.temp_password}
                  </Text>
                </Text>
              </View>
            )}
            <View style={styles.feeButtonsRow}>
              <TouchableOpacity
                style={styles.feeCancelBtn}
                onPress={() => {
                  setSuccessModalVisible(false);
                  setNewRiderInfo(null);
                  handleRefresh();
                }}
              >
                <Text style={[styles.feeBtnText, { color: theme.text }]}>
                  Done
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.feeConfirmBtn,
                  { backgroundColor: theme.textSecondary },
                ]}
                onPress={handleShareCredentials}
              >
                <Text style={[styles.feeBtnText, { color: "#000" }]}>
                  Share Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const useStyles = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        // Date header
        dateHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
        },
        dateText: {
          fontSize: 15,
          fontWeight: "700",
          flex: 1,
        },

        searchContainer: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 48,
          backgroundColor: theme.primary,
        },
        searchInput: {
          flex: 1,
          marginLeft: 8,
          color: theme.text,
          fontSize: 15,
        },
        credentialsBox: {
          backgroundColor: theme.background,
          padding: 16,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 20,
        },
        feeInput: {
          fontSize: 16,
          color: theme.text,
          backgroundColor: theme.background,
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 20,
          textAlign: "center",
        },
        credLabel: { fontSize: 14, color: theme.secondary, marginBottom: 8 },
        credValue: { fontSize: 15, fontWeight: "700", color: theme.heading },

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
        primaryAddress: {
          fontSize: 15,
          fontWeight: "700",
          color: theme.heading,
          marginBottom: 4,
          lineHeight: 20,
        },
        secondaryCustomerInfo: {
          fontSize: 13,
          color: theme.secondary,
          marginBottom: 4,
          fontWeight: "500",
        },
        infoRow: {
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 6,
        },
        slot: { fontSize: 12, color: theme.secondary, fontWeight: "500" },
        divider: {
          height: 1,
          backgroundColor: theme.border,
          marginVertical: 12,
        },

        actionBtn: {
          paddingVertical: 9,
          paddingHorizontal: 14,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        },
        actionBtnText: { fontSize: 13, fontWeight: "600" },
        assignBtn: { alignSelf: "flex-start", minWidth: 120 },
        reassignBtn: { borderWidth: 1, borderColor: theme.textSecondary },
        assignedRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        assignedBadge: {
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: `${theme.success ?? "#16a34a"}15`,
          paddingHorizontal: 8,
          paddingVertical: 8,
          borderRadius: 8,
          flex: 1,
          marginRight: 10,
        },
        assignedRiderText: {
          fontSize: 14,
          fontWeight: "700",
          color: theme.success ?? "#16a34a",
          marginLeft: 6,
          flex: 1,
        },
        assign: { flexDirection: "row", alignItems: "center" },
        feeText: {
          fontSize: 12,
          fontWeight: "600",
          color: theme.text,
          marginTop: 4,
          marginLeft: 21,
        },

        container: { flex: 1, backgroundColor: theme.background },
        centered: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          gap: 12,
        },
        loadingText: { marginTop: 12, color: theme.secondary, fontSize: 14 },
        errorText: { color: theme.secondary, fontSize: 16 },
        retryBtn: {
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 10,
          marginTop: 4,
        },
        retryText: { color: "#000", fontWeight: "700" },

        bulkBar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        bulkCount: { color: "#fff", fontWeight: "700", fontSize: 15 },
        bulkActions: { flexDirection: "row", alignItems: "center", gap: 10 },
        bulkClearBtn: { paddingHorizontal: 12, paddingVertical: 6 },
        bulkClearText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
        bulkAssignBtn: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        },
        bulkAssignText: { fontWeight: "700", fontSize: 13 },

        headerContainer: { marginBottom: 12 },
        list: { padding: 16, paddingTop: 8, paddingBottom: 120 },
        listHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 8,
        },
        listHeaderText: {
          fontSize: 13,
          fontWeight: "600",
          color: theme.secondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        selectAllText: { fontSize: 13, fontWeight: "600" },

        card: {
          backgroundColor: theme.primary,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 1,
        },
        cardSelected: { borderColor: theme.secondary },
        selectedStrip: {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: theme.textSecondary,
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
        },
        cardInner: { flexDirection: "row", padding: 14, paddingLeft: 10 },

        checkbox: {
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: theme.border,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
          marginTop: 2,
        },
        checkboxChecked: {
          backgroundColor: theme.secondary,
          borderColor: theme.secondary,
        },
        checkboxMark: { fontSize: 13, fontWeight: "700" },

        orderContent: { flex: 1 },
        row: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        },
        orderNum: { fontSize: 16, fontWeight: "700", color: theme.heading },
        badges: { flexDirection: "row", gap: 6 },
        codBadge: {
          backgroundColor: "rgba(234,179,8,0.15)",
          paddingHorizontal: 7,
          paddingVertical: 3,
          borderRadius: 6,
        },
        codBadgeText: { fontSize: 11, fontWeight: "700", color: "#d97706" },
        statusBadge: {
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
        },
        statusText: { fontSize: 11, fontWeight: "600" },
        amount: { fontSize: 15, fontWeight: "700", color: theme.heading },

        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        },
        feeModalContainer: {
          width: "100%",
          backgroundColor: theme.primary,
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
        feeTitle: {
          fontSize: 18,
          fontWeight: "700",
          color: theme.heading,
          marginBottom: 6,
          textAlign: "center",
        },
        feeSubtitle: {
          fontSize: 14,
          color: theme.secondary,
          marginBottom: 20,
          textAlign: "center",
        },
        inputLabel: {
          fontSize: 13,
          fontWeight: "600",
          marginBottom: 6,
          marginTop: 10,
        },
        formInput: {
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
          color: theme.text,
          backgroundColor: theme.background,
          marginBottom: 10,
        },
        feeButtonsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
        feeCancelBtn: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: theme.border,
          alignItems: "center",
        },
        feeConfirmBtn: {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        },
        feeBtnText: { fontSize: 15, fontWeight: "600" },

        pickerOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        },
        pickerSheet: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
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
          marginBottom: 15,
        },
        pickerTitle: { fontSize: 18, fontWeight: "700" },
        closeBtn: { padding: 4 },
      }),
    [theme],
  );

export default OrdersTab;
