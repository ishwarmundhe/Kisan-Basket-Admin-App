import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Portal, PaperProvider } from "react-native-paper";
import { toast } from "sonner-native";
import ShimmerPlaceholder from "../../../components/custom/shimmerLoaderPlaceholder";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import CustomerList from "../../../components/custom/customerList";
import BottomSheetProductListContent from "../../../components/custom/bottomSheetProductList";
import BottomSheet from "../../../components/custom/CustomBottomSheet";
import ErrorMessage from "../../../components/custom/errorMessage";
import OrderTable from "./component/OrderTable";

// GraphQL
import {
  PRODUCT_LIST_QUERY,
  ORDER_DETAILS_WITH_METADATA,
} from "../../../graphql/Query";
import {
  CANCEL_ORDER_QUERY,
  ORDER_LINE_DELETE,
  ORDER_DRAFT_FINALIZE,
  ORDER_DRAFT_CANCEL,
  ORDER_LINE_UPDATE,
} from "../../../graphql/Mutation";

// Services & Context
import { AuthContext } from "../../../constant/AuthProvider";
import { GetOrderSlots } from "../../../axiosServices/services";
import { useTheme } from "../../../constant/ThemeContext";
import { useStyle } from "./component/UseStyle";

export default function OrderSummaryScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  // Context and route params
  const { token, setGlobalRefresh } = useContext(AuthContext);
  const { order_id, cancellationOrder = false } = route?.params || {};

  // Refs
  const animationRef = useRef(null);

  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [customerVisible, setCustomerVisible] = useState(false);
  const [orderWithMetaData, setOrderWithMetaData] = useState([]);
  const [orderSlots, setOrderSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [visible, setVisible] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const [confirmOrderModalVisible, setConfirmOrderModalVisible] =
    useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Date management
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  });

  // GraphQL operations
  const [updateOrderProduct] = useMutation(ORDER_LINE_UPDATE);
  const [orderDraftFinalize, { loading: isFinalizing }] =
    useMutation(ORDER_DRAFT_FINALIZE);
  const [fetchOrderDetails, { isLoading: fetchMetaDataLoading }] = useLazyQuery(
    ORDER_DETAILS_WITH_METADATA,
  );
  const [cancelOrderQuery, { isLoading: cancelLoading }] =
    useMutation(CANCEL_ORDER_QUERY);
  const [deleteOrderProduct] = useMutation(ORDER_LINE_DELETE);
  const [orderDraftCancel, { loading: isCancelling }] =
    useMutation(ORDER_DRAFT_CANCEL);

  const { data: initialData, error } = useQuery(PRODUCT_LIST_QUERY, {
    variables: { first: 50, channel: "pune" },
    onCompleted: (data) => setProductList(data?.products?.edges || []),
  });

  const [searchProducts, { data: searchData, loading: searchLoading }] =
    useLazyQuery(PRODUCT_LIST_QUERY, {
      fetchPolicy: "network-only",
      onCompleted: (data) => setProductList(data?.products?.edges || []),
    });

  const formattedDate = selectedDate?.toLocaleDateString("en-CA");
  const isLoading = searchLoading || isCancelling;

  const orderLines = useMemo(
    () =>
      orderWithMetaData?.map((line) => ({
        id: line.id,
        productName: line.productName,
        variantName: line.variantName,
        quantity: line.quantity,
        amount: line.unitPrice.gross.amount,
        currency: line.unitPrice.gross.currency,
      })) || [],
    [orderWithMetaData],
  );
  console.log("Order lines with metadata:", orderWithMetaData);
  console.log("Transformed order lines for table:", orderLines);

  const updateQuantity = async (lineId, newQuantity) => {
    if (!lineId || newQuantity < 1) return;

    try {
      setLocalLoading(true);
      const response = await updateOrderProduct({
        variables: {
          id: lineId,
          input: { quantity: newQuantity },
        },
      });

      const errors = response?.data?.orderLineUpdate?.errors || [];
      if (errors.length > 0) {
        toast.warning(errors[0].message || "Quantity not updated");
      } else {
        await fetchOrderData(true);
      }
    } catch (err) {
      toast.error("Failed to update quantity");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      if (query.trim()) {
        searchProducts({
          variables: {
            first: 20,
            channel: "pune",
            filter: { search: query },
          },
        });
      } else {
        setProductList(initialData?.products?.edges || []);
      }
    },
    [initialData, searchProducts],
  );

  const fetchOrderData = useCallback(
    async (forceFetch = false) => {
      if ((cancellationOrder && order_id) || forceFetch) {
        try {
          setLocalLoading(true);
          const { data } = await fetchOrderDetails({
            variables: { id: order_id },
            fetchPolicy: "network-only",
          });
          setOrderWithMetaData(data?.order?.lines || []);
          setOrderStatus(data?.order?.status || "");
        } catch (err) {
          toast.error("Failed to fetch order details");
        } finally {
          setLocalLoading(false);
        }
      }
    },
    [cancellationOrder, order_id],
  );

  const deleteProduct = async (id) => {
    if (!id) {
      toast.warning("Product ID not found");
      return;
    }
    try {
      const response = await deleteOrderProduct({ variables: { id } });
      const error = response?.data?.orderLineDelete?.errors || [];
      if (error.length > 0) {
        toast.warning(error[0].message || "Order not deleted");
      } else {
        toast.success("Product deleted successfully");
        await fetchOrderData(true);
      }
    } catch (err) {
      toast.error("Order delete failed");
    }
  };

  const orderSlotQuery = useCallback(async () => {
    try {
      const orderSlotResult = await GetOrderSlots(token);
      setOrderSlots(orderSlotResult);
      setSelectedSlot(orderSlotResult[0]);
    } catch (err) {
      toast.error("Order slot failed: " + err.message);
    }
  }, [token, order_id, selectedDate]);

  const setMetaDataHandle = useCallback((metadata) => {
    setOrderWithMetaData(metadata || []);
    setIsVisible(false);
  }, []);

  const handleSelect = useCallback((slot) => {
    setSelectedSlot(slot);
  }, []);

  const onChangeDate = useCallback(
    (event, date) => {
      setShowPicker(false);
      if (date) setSelectedDate(date);
    },
    [selectedDate],
  );

  const ConfirmOrder = useCallback(async () => {
    try {
      await toast.promise(
        orderDraftFinalize({
          variables: {
            id: order_id,
            date: formattedDate,
            slot: selectedSlot,
          },
        }),
        {
          loading: "Finalizing order...",
          success: (response) => {
            const errors = response?.data?.draftOrderComplete?.errors || [];
            if (errors.length > 0) {
              throw new Error(errors.map((err) => err.message).join("\n"));
            }
            setShowSuccess(true);
            animationRef.current?.play();
            setGlobalRefresh(true);
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
            return "Order confirmed successfully!";
          },
          error: (err) => err?.message || "Failed to confirm order.",
        },
      );
    } catch (err) {
      toast.error("Unexpected Error");
    }
  }, [token, selectedDate, formattedDate, selectedSlot]);

  const cancelOrder = useCallback(async () => {
    try {
      setLocalLoading(true);
      const { data } = await cancelOrderQuery({ variables: { id: order_id } });
      if (data.orderCancel.errors.length === 0) {
        setOrderStatus(data?.orderCancel?.order?.status || "");
        setGlobalRefresh(true);
        navigation.goBack();
      } else {
        toast.error("Order cancel failed");
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Failed to cancel order");
    } finally {
      setLocalLoading(false);
    }
  }, [order_id]);

  const cancelDraft = useCallback(async (id) => {
    if (!id) {
      toast.error("Order ID is missing");
      return;
    }
    try {
      const { data } = await orderDraftCancel({ variables: { id } });
      const errors = data?.draftOrderDelete?.errors || [];
      if (errors.length > 0) {
        throw new Error(errors[0]?.message || "Failed to cancel draft order");
      }
      toast.success("Draft order cancelled successfully");
      setGlobalRefresh(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      toast.error(err.message || "Failed to cancel draft order");
    }
  }, []);

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    if (cancellationOrder) {
      cancelOrder();
    } else {
      cancelDraft(order_id);
    }
  };

  const toggleBottomSheet = useCallback(
    () => setIsVisible((prev) => !prev),
    [],
  );
  const showModal = useCallback(() => setVisible(true), []);
  const hideModal = useCallback(() => setVisible(false), []);
  const CancelBottomSheet = useCallback(() => {
    setIsVisible(false);
    setCustomerVisible(false);
  }, []);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  useEffect(() => {
    if (!cancellationOrder) orderSlotQuery();
  }, [cancellationOrder, orderSlotQuery]);

  useEffect(() => {
    if (searchQuery && searchData) {
      setProductList(searchData.products?.edges || []);
    } else if (!searchQuery && initialData) {
      setProductList(initialData.products?.edges || []);
    }
  }, [initialData, searchData, searchQuery]);

  const renderSlotModal = useCallback(
    () => (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          {orderSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(slot)}
              style={styles.slotItem}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedSlot === slot && styles.selectedSlotText,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
              <Text style={[styles.confirmButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: theme.textSecondary },
              ]}
              onPress={hideModal}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    ),
    [visible, orderSlots, selectedSlot, theme],
  );

  const renderActionButtons = useCallback(() => {
    if (cancellationOrder) {
      return (
        <View style={styles.actionButtonContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{orderStatus}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            // Changed to trigger modal
            onPress={() => setCancelModalVisible(true)}
          >
            <Text style={styles.buttonText}>
              {cancelLoading || localLoading ? "Cancelling..." : "Cancel"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setCancelModalVisible(true)}
          disabled={isCancelling}
        >
          <Text style={styles.buttonText}>
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleBottomSheet}
        >
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>
    );
  }, [cancellationOrder, orderStatus, isCancelling]);

  const renderCustomerSelection = useCallback(
    () => (
      <TouchableOpacity
        style={styles.selectionInput}
        onPress={() => {
          if (orderWithMetaData.length > 0) {
            setCustomerVisible(true);
          } else {
            toast.warning("Please add product before selecting a customer.");
          }
        }}
      >
        <TextInput
          placeholder="Select Customer Address"
          placeholderTextColor={theme.secondary}
          style={styles.selectionText}
          editable={false}
          value={
            selectedCustomerData?.firstName && selectedCustomerData?.lastName
              ? `${selectedCustomerData.firstName} ${selectedCustomerData.lastName}`
              : ""
          }
        />
        <Icon name="chevron-down-outline" size={20} color={theme.text} />
      </TouchableOpacity>
    ),
    [orderWithMetaData.length, selectedCustomerData, theme],
  );

  const renderDateSelection = useCallback(
    () => (
      <TouchableOpacity
        style={styles.selectionInput}
        onPress={() => setShowPicker(true)}
      >
        <TextInput
          placeholder="Select Order Date"
          placeholderTextColor={theme.secondary}
          style={styles.selectionText}
          editable={false}
          value={formattedDate}
        />
        <Icon name="chevron-down-outline" size={20} color={theme.text} />
      </TouchableOpacity>
    ),
    [formattedDate, selectedDate, theme],
  );

  const renderSlotSelection = useCallback(
    () => (
      <TouchableOpacity style={styles.selectionInput} onPress={showModal}>
        <TextInput
          placeholder="Available Slots"
          placeholderTextColor={theme.secondary}
          style={styles.selectionText}
          editable={false}
          value={selectedSlot}
        />
        <Icon name="chevron-down-outline" size={20} color={theme.text} />
      </TouchableOpacity>
    ),
    [selectedSlot, selectedDate, theme],
  );

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {localLoading || fetchMetaDataLoading ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            {[...Array(2)].map((_, index) => (
              <View key={index} style={styles.shimmerCard}>
                <ShimmerPlaceholder height={30} width="60%" borderRadius={6} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            {error && <ErrorMessage errorMessage={error.message} />}
            {renderActionButtons()}

            <OrderTable
              orderLines={orderLines}
              onDeleteProduct={deleteProduct}
              onUpdateQuantity={updateQuantity}
              isEditable={!cancellationOrder || orderStatus === "UNCONFIRMED"}
            />
          </ScrollView>
        )}

        {!cancellationOrder && (
          <View style={{ backgroundColor: theme.background }}>
            {renderCustomerSelection()}
            {renderDateSelection()}
            {showPicker && (
              <DateTimePicker
                mode="date"
                display="default"
                value={selectedDate}
                onChange={onChangeDate}
              />
            )}
            {renderSlotSelection()}
            <TouchableOpacity
              style={[styles.confirmButton, isFinalizing && { opacity: 0.6 }]}
              onPress={() => setConfirmOrderModalVisible(true)}
              disabled={isFinalizing}
            >
              <Text style={styles.confirmButtonText}>
                {isFinalizing ? "Confirming..." : "Confirm Order"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {renderSlotModal()}
        {showSuccess && (
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require("../../../assets/animation/Success.json")}
              autoPlay
              loop={false}
              style={styles.animation}
            />
          </View>
        )}
      </SafeAreaView>

      {customerVisible && (
        <BottomSheet
          addCustomer={true}
          paddingBottom={20}
          fontStyle="normal"
          backgroundColor={theme.primary}
          fontSize={22}
          title="Customer list"
          height="80%"
          setStatus={setCustomerVisible}
          visible={customerVisible}
          onClose={() => setCustomerVisible(false)}
          onPress={() => {
            setCustomerVisible(false);
            navigation.navigate("createCustomer");
          }}
        >
          <CustomerList
            customerPersonalInfo={setSelectedCustomerData}
            order_id={order_id}
            CancelBottomSheet={CancelBottomSheet}
          />
        </BottomSheet>
      )}

      {isVisible && (
        <BottomSheet
          paddingBottom={20}
          fontStyle="normal"
          fontSize={22}
          title="Product list"
          height="88%"
          backgroundColor={theme.primary}
          setStatus={setIsVisible}
          visible={isVisible}
          onClose={() => setIsVisible(false)}
        >
          <BottomSheetProductListContent
            loading={isLoading}
            list={productList}
            order_id={order_id}
            receiveMetaData={setMetaDataHandle}
            CancelBottomSheet={CancelBottomSheet}
            onSearchChange={handleSearch}
            currentSearch={searchQuery}
          />
        </BottomSheet>
      )}

      <Portal>
        <Modal
          visible={cancelModalVisible}
          onDismiss={() => setCancelModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={{ fontSize: 16, marginBottom: 20, color: theme.text }}>
            Are you sure you want to cancel this order?
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 20,
            }}
          >
            <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
              <Text
                style={{
                  color: theme.secondary,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirmCancel}>
              <Text
                style={{ color: theme.error, fontWeight: "600", fontSize: 16 }}
              >
                Yes, Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          visible={confirmOrderModalVisible}
          onDismiss={() => setConfirmOrderModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={{ fontSize: 16, marginBottom: 20, color: theme.text }}>
            Are you sure you want to confirm and place this order?
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setConfirmOrderModalVisible(false)}
            >
              <Text
                style={{
                  color: theme.secondary,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                No
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setConfirmOrderModalVisible(false);
                ConfirmOrder();
              }}
            >
              <Text
                style={{
                  color: theme.deliveryDate || "#4ade80",
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Yes, Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </PaperProvider>
  );
}
