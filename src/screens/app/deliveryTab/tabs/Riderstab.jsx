import React, { useState, useMemo, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  TextInput,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import {
  useGetRidersListQuery,
  useGetPendingRidersListQuery,
  useSearchRiderQuery,
  useApproveRiderMutation,
  useRejectRiderMutation,
} from "../../../../services/deliveryApi";
import { WAREHOUSE_LIST, GET_CHANNELS } from "../../../../graphql/Query";
import { useQuery } from "@apollo/client/react";
import { useTheme } from "../../../../constant/ThemeContext";

const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  rider,
  action,
  isLoading,
  channels,
  warehouses,
}) => {
  const { theme } = useTheme();
  const isApprove = action === "approve";

  // Dropdown states
  const [channelId, setChannelId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // Reset dropdowns when modal opens/closes
  useEffect(() => {
    if (visible) {
      setChannelId("");
      setWarehouseId("");
      setShowChannelDropdown(false);
      setShowWarehouseDropdown(false);
    }
  }, [visible]);

  const isConfirmDisabled =
    isLoading || (isApprove && (!channelId || !warehouseId));

  const handleConfirmPress = () => {
    if (isApprove) {
      onConfirm({ channel_id: channelId, warehouse_id: warehouseId });
    } else {
      onConfirm(); // Reject doesn't need body
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: "100%",
            maxHeight: "85%", // prevent overflow
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.border,
          }}
          onPress={(e) => e.stopPropagation()} // Keep modal open when tapping inside
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: theme.heading,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {isApprove ? "Approve Rider?" : "Reject Rider?"}
            </Text>

            {rider && (
              <View
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.border,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 15,
                    color: theme.heading,
                  }}
                >
                  {rider.full_name}
                </Text>
                <Text
                  style={{ color: theme.secondary, fontSize: 13, marginTop: 2 }}
                >
                  {rider.email || "No email"}
                </Text>
                <Text
                  style={{ color: theme.secondary, fontSize: 13, marginTop: 2 }}
                >
                  {rider.phone}
                </Text>
                {rider.address ? (
                  <Text
                    style={{
                      color: theme.secondary,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                    numberOfLines={2}
                  >
                    📍 {rider.address}
                  </Text>
                ) : null}
              </View>
            )}

            <Text
              style={{
                color: theme.secondary,
                fontSize: 13,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {isApprove
                ? "This rider will be able to accept delivery assignments. Please select a Channel and Warehouse to assign them to."
                : "This rider's application will be rejected."}
            </Text>

            {/* CHANNEL & WAREHOUSE DROPDOWNS ONLY FOR APPROVE */}
            {isApprove && (
              <View style={{ width: "100%", marginBottom: 20 }}>
                {/* Channel */}
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  Select Channel *
                </Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 10,
                    padding: 14,
                    backgroundColor: theme.primary,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: showChannelDropdown ? 8 : 16,
                  }}
                  onPress={() => {
                    setShowChannelDropdown(!showChannelDropdown);
                    setShowWarehouseDropdown(false);
                  }}
                >
                  <Text
                    style={{
                      color: channelId ? theme.text : theme.secondary,
                      fontSize: 15,
                    }}
                  >
                    {channels.find((c) => c.id === channelId)?.name ||
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
                      marginBottom: 16,
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
                          setChannelId(channel.id);
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

                {/* Warehouse */}
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  Select Warehouse *
                </Text>
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 10,
                    padding: 14,
                    backgroundColor: theme.primary,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: showWarehouseDropdown ? 8 : 16,
                  }}
                  onPress={() => {
                    setShowWarehouseDropdown(!showWarehouseDropdown);
                    setShowChannelDropdown(false);
                  }}
                >
                  <Text
                    style={{
                      color: warehouseId ? theme.text : theme.secondary,
                      fontSize: 15,
                    }}
                  >
                    {warehouses.find((w) => w.id === warehouseId)?.name ||
                      "Select Warehouse"}
                  </Text>
                  <Ionicons
                    name={showWarehouseDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={theme.secondary}
                  />
                </TouchableOpacity>

                {showWarehouseDropdown && (
                  <ScrollView
                    style={{
                      maxHeight: 150,
                      backgroundColor: theme.primary,
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderRadius: 10,
                      marginBottom: 16,
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
                          setWarehouseId(warehouse.id);
                          setShowWarehouseDropdown(false);
                        }}
                      >
                        <Text style={{ color: theme.text, fontSize: 15 }}>
                          {warehouse.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={onClose}
              >
                <Text style={{ fontWeight: "600", color: theme.secondary }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: isApprove
                    ? (theme.success ?? "#16a34a")
                    : (theme.error ?? "#dc2626"),
                  opacity: isConfirmDisabled ? 0.6 : 1, // Visual feedback if disabled
                }}
                onPress={handleConfirmPress}
                disabled={isConfirmDisabled}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {isApprove ? "Approve" : "Reject"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// RidersTab
const RidersTab = (date) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPending, setShowPending] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    rider: null,
    action: null,
  });

  // ── Queries
  const { data: warehouseList } = useQuery(WAREHOUSE_LIST);
  const { data: channelList } = useQuery(GET_CHANNELS);

  const channels = channelList?.publicChannels || [];
  const warehouses =
    warehouseList?.warehouses?.edges?.map((edge) => edge.node) || [];

  const {
    data: allRiders,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useGetRidersListQuery(undefined, {
    skip: showPending || searchQuery.length > 0,
  });

  const {
    data: pendingRiders,
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = useGetPendingRidersListQuery(undefined, {
    skip: !showPending || searchQuery.length > 0,
  });

  const { data: searchedRiders, isLoading: isLoadingSearch } =
    useSearchRiderQuery(searchQuery, { skip: searchQuery.length === 0 });

  const [approveRider, { isLoading: isApproving }] = useApproveRiderMutation();
  const [rejectRider, { isLoading: isRejecting }] = useRejectRiderMutation();

  const isLoading = isLoadingAll || isLoadingPending || isLoadingSearch;
  const isActing = isApproving || isRejecting;

  const ridersData = useMemo(() => {
    if (searchQuery.length > 0) return searchedRiders?.riders ?? [];
    if (showPending) return pendingRiders?.riders ?? [];
    return allRiders?.riders ?? [];
  }, [searchQuery, showPending, allRiders, pendingRiders, searchedRiders]);

  const refetchActive = () => {
    if (showPending) refetchPending?.();
    else refetchAll?.();
  };

  const promptAction = (rider, action) => {
    setConfirmModal({ visible: true, rider, action });
  };

  // Receive the approveData payload from the Modal component
  const handleConfirm = async (approveData) => {
    const { rider, action } = confirmModal;
    try {
      if (action === "approve") {
        await approveRider({
          rider_id: rider.id,
          body: approveData, // Includes { channel_id, warehouse_id }
        }).unwrap();
        toast.success("Approved", {
          description: `${rider.full_name} has been approved`,
        });
      } else {
        await rejectRider({ rider_id: rider.id, body: {} }).unwrap();
        toast.success("Rejected", {
          description: `${rider.full_name} has been rejected`,
        });
      }
      setConfirmModal({ visible: false, rider: null, action: null });
      refetchActive();
    } catch (err) {
      setConfirmModal({ visible: false, rider: null, action: null });
      toast.error("Error", {
        description: err?.data?.message ?? "Action failed",
      });
    }
  };

  const renderRider = ({ item }) => {
    const isPending = item.approval_status === "pending";
    const isRejected = item.approval_status === "rejected";
    const isApproved = item.approval_status === "approved";

    const badgeStyle = isPending
      ? styles.badgePending
      : isRejected
        ? styles.badgeRejected
        : styles.badgeApproved;
    const badgeTextStyle = isPending
      ? styles.badgeTextPending
      : isRejected
        ? styles.badgeTextRejected
        : styles.badgeTextApproved;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              isApproved && styles.avatarApproved,
              isPending && styles.avatarPending,
              isRejected && styles.avatarRejected,
            ]}
          >
            <Text style={styles.avatarText}>
              {(item.full_name || "?")[0].toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.riderName}>
              {item.full_name || "Unknown Rider"}
            </Text>
            <Text style={styles.riderEmail}>{item.email || "No email"}</Text>
            <Text style={styles.riderPhone}>{item.phone}</Text>
            {item.address ? (
              <Text style={styles.riderAddress} numberOfLines={1}>
                {item.address}
              </Text>
            ) : null}
          </View>

          <View>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={[styles.badgeText, badgeTextStyle]}>
                {item.approval_status?.toUpperCase()}
              </Text>
            </View>
            {isApproved && item.total_deliveries >= 0 && (
              <Text style={styles.deliveryCount}>
                {item.total_deliveries} deliveries
              </Text>
            )}
          </View>
        </View>

        {isPending && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() => promptAction(item, "reject")}
              style={[styles.button, styles.buttonReject]}
              disabled={isActing}
            >
              <Text style={styles.buttonTextReject}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => promptAction(item, "approve")}
              style={[styles.button, styles.buttonApprove]}
              disabled={isActing}
            >
              <Text style={styles.buttonTextApprove}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search riders by name or phone…"
        placeholderTextColor={theme.secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoCorrect={false}
      />

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => {
            setShowPending(false);
            setSearchQuery("");
          }}
          style={[
            styles.filterButton,
            !showPending && !searchQuery
              ? styles.filterButtonActive
              : styles.filterButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              !showPending && !searchQuery
                ? styles.filterTextActive
                : styles.filterTextInactive,
            ]}
          >
            All Riders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setShowPending(true);
            setSearchQuery("");
          }}
          style={[
            styles.filterButton,
            showPending && !searchQuery
              ? styles.filterButtonActive
              : styles.filterButtonInactive,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              showPending && !searchQuery
                ? styles.filterTextActive
                : styles.filterTextInactive,
            ]}
          >
            Pending Approvals
          </Text>
          {(pendingRiders?.riders?.length ?? 0) > 0 && (
            <View style={[styles.countBadge]}>
              <Text style={styles.countBadgeText}>
                {pendingRiders.riders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.textSecondary} />
        </View>
      ) : (
        <FlatList
          data={ridersData}
          keyExtractor={(item) =>
            item.id?.toString() ?? Math.random().toString()
          }
          renderItem={renderRider}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No riders found</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetchActive}
              tintColor={theme.textSecondary}
            />
          }
        />
      )}

      <ConfirmModal
        visible={confirmModal.visible}
        rider={confirmModal.rider}
        action={confirmModal.action}
        isLoading={isActing}
        channels={channels}
        warehouses={warehouses}
        onClose={() =>
          setConfirmModal({ visible: false, rider: null, action: null })
        }
        onConfirm={handleConfirm}
      />
    </View>
  );
};

// Styles
const useStyles = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.background,
          padding: 16,
        },
        searchInput: {
          height: 48,
          backgroundColor: theme.primary,
          paddingHorizontal: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 12,
          color: theme.text,
          fontSize: 14,
        },
        filterContainer: {
          flexDirection: "row",
          gap: 10,
          marginBottom: 16,
        },
        filterButton: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: theme.border,
          gap: 6,
        },
        filterButtonActive: {
          backgroundColor: theme.textSecondary,
          borderColor: theme.textSecondary,
        },
        filterButtonInactive: { backgroundColor: theme.primary },
        filterText: { fontWeight: "600", fontSize: 13 },
        filterTextActive: { color: theme.primary },
        filterTextInactive: { color: theme.secondary },
        countBadge: {
          minWidth: 18,
          height: 18,
          borderRadius: 9,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 4,
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 1,
          borderColor: theme.error ?? "#dc2626",
        },
        countBadgeText: {
          color: theme.error ?? "#dc2626",
          fontSize: 11,
          fontWeight: "700",
        },

        loaderContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
        listContent: { paddingBottom: 24 },
        emptyText: {
          textAlign: "center",
          color: theme.secondary,
          marginTop: 48,
          fontSize: 15,
        },

        card: {
          marginBottom: 12,
          borderRadius: 14,
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
          padding: 14,
        },
        cardHeader: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        },

        avatar: {
          width: 46,
          height: 46,
          borderRadius: 23,
          justifyContent: "center",
          alignItems: "center",
        },
        avatarApproved: {
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          borderWidth: 1,
          borderColor: theme.success ?? "#16a34a",
        },
        avatarPending: {
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          borderWidth: 1,
          borderColor: "#d97706",
        },
        avatarRejected: {
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 1,
          borderColor: theme.error ?? "#dc2626",
        },
        avatarText: { fontSize: 20, fontWeight: "700", color: theme.heading },

        info: { flex: 1 },
        riderName: { fontSize: 16, fontWeight: "700", color: theme.heading },
        riderEmail: { fontSize: 13, color: theme.secondary, marginTop: 1 },
        riderPhone: { fontSize: 13, color: theme.secondary, marginTop: 1 },
        riderAddress: { fontSize: 11, color: theme.secondary, marginTop: 3 },
        deliveryCount: {
          fontSize: 11,
          color: theme.secondary,
          textAlign: "right",
          marginTop: 4,
        },

        // Badge (Soft background, dark border)
        badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
        badgePending: {
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          borderWidth: 1,
          borderColor: "#d97706",
        },
        badgeRejected: {
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 1,
          borderColor: theme.error ?? "#dc2626",
        },
        badgeApproved: {
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          borderWidth: 1,
          borderColor: theme.success ?? "#16a34a",
        },
        badgeText: { fontSize: 11, fontWeight: "700" },
        badgeTextPending: { color: "#d97706" },
        badgeTextRejected: { color: theme.error ?? "#dc2626" },
        badgeTextApproved: { color: theme.success ?? "#16a34a" },

        actionContainer: {
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 12,
        },

        button: {
          paddingHorizontal: 20,
          paddingVertical: 9,
          borderRadius: 8,
        },
        buttonReject: {
          backgroundColor: "rgba(220, 38, 38, 0.1)",
          borderWidth: 1,
          borderColor: theme.error ?? "#dc2626",
        },
        buttonApprove: {
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          borderWidth: 1,
          borderColor: theme.success ?? "#16a34a",
        },
        buttonTextReject: {
          color: theme.error ?? "#dc2626",
          fontWeight: "700",
          fontSize: 13,
        },
        buttonTextApprove: {
          color: theme.success ?? "#16a34a",
          fontWeight: "700",
          fontSize: 13,
        },
      }),
    [theme],
  );

export default RidersTab;
