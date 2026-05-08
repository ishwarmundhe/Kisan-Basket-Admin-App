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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Portal } from "react-native-paper";
import { toast } from "sonner-native";
import ShimmerPlaceholder from "../../../components/custom/shimmerLoaderPlaceholder";
import { SafeAreaView } from "react-native-safe-area-context";
import { CHANNEL, URL } from "@env";
import { useAiOrderPromptMutation } from "../../../services/deliveryApi";
import { Dimensions } from "react-native";

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
  CHECKOUT_SHIPPING_METHODS_QUERY,
  GET_CHANNELS,
  SEARCH_CUSTOMER_QUERY,
  CUSTOMER_ADDRESSES,
  GET_SHIPPING_METHODS,
} from "../../../graphql/Query";
import {
  CANCEL_ORDER_QUERY,
  ORDER_LINE_DELETE,
  ORDER_DRAFT_FINALIZE,
  ORDER_DRAFT_CANCEL,
  ORDER_LINE_UPDATE,
  SHIPPING_METHOD_UPDATE,
  ORDER_LINE_ADD,
  ORDER_DRAFT_UPDATE,
} from "../../../graphql/Mutation";

// Services & Context
import { AuthContext } from "../../../constant/AuthProvider";
import { GetOrderSlots } from "../../../axiosServices/services";
import { useTheme } from "../../../constant/ThemeContext";
import { useStyle } from "./component/UseStyle";

export default function OrderSummaryScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  // Context and route params
  const { token, setGlobalRefresh } = useContext(AuthContext);
  const { order_id, cancellationOrder = false } = route?.params || {};

  // Refs
  const animationRef = useRef(null);
  const aiPromptTextRef = useRef("");
  const promptInputRef = useRef(null);

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
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isChangingVariant, setIsChangingVariant] = useState(false);

  const [confirmOrderModalVisible, setConfirmOrderModalVisible] =
    useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // NEW STATES FOR CUSTOM UNMATCHED ITEMS MODAL
  const [unmatchedModalVisible, setUnmatchedModalVisible] = useState(false);
  const [unmatchedItemsText, setUnmatchedItemsText] = useState("");

  const [AIOrderPrompt] = useAiOrderPromptMutation();

  // Date management
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  });

  // GraphQL operations
  const [searchCustomers] = useLazyQuery(SEARCH_CUSTOMER_QUERY);
  const [singleCustomerAddresses] = useLazyQuery(CUSTOMER_ADDRESSES);
  const [getShippingMethods] = useLazyQuery(GET_SHIPPING_METHODS);
  const [updateOrderDraft] = useMutation(ORDER_DRAFT_UPDATE);
  const [orderLineAddMutation] = useMutation(ORDER_LINE_ADD);
  const [updateShippingMethod] = useMutation(SHIPPING_METHOD_UPDATE);
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

  const { data: shippingMethodData } = useQuery(
    CHECKOUT_SHIPPING_METHODS_QUERY,
    {
      variables: { channelSlug: CHANNEL },
      fetchPolicy: "cache-and-network",
    },
  );

  const { data: initialData, error } = useQuery(PRODUCT_LIST_QUERY, {
    variables: { first: 50, channel: CHANNEL },
    onCompleted: (data) => setProductList(data?.products?.edges || []),
  });

  const [searchProducts, { data: searchData, loading: searchLoading }] =
    useLazyQuery(PRODUCT_LIST_QUERY, {
      fetchPolicy: "network-only",
      onCompleted: (data) => setProductList(data?.products?.edges || []),
    });

  const formattedDate = selectedDate?.toLocaleDateString("en-CA");
  const isLoading = searchLoading || isCancelling;
  const isUIBusy = localLoading || aiLoading || fetchMetaDataLoading;

  const orderLines = useMemo(
    () =>
      orderWithMetaData?.map((line) => ({
        id: line.id,
        productName: line.productName,
        variantName: line.variantName,
        variantId: line.variant?.id,
        productId: line.variant?.product?.id,
        quantity: line.quantity,
        amount: line.unitPrice.gross.amount,
        currency: line.unitPrice.gross.currency,
      })) || [],
    [orderWithMetaData],
  );

  const updateQuantity = async (lineId, newQuantity) => {
    if (!lineId || newQuantity < 1 || isUIBusy) return;
    try {
      setLocalLoading(true);
      const response = await updateOrderProduct({
        variables: { id: lineId, input: { quantity: newQuantity } },
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
          variables: { first: 20, channel: CHANNEL, filter: { search: query } },
        });
      } else {
        setProductList(initialData?.products?.edges || []);
      }
    },
    [initialData, searchProducts],
  );

  const fetchOrderData = useCallback(
    async (forceFetch = false) => {
      if (order_id) {
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
    [order_id],
  );

  const changeVariant = useCallback(
    async (lineId, newVariantId, quantity) => {
      if (!lineId || !newVariantId || isChangingVariant) return;
      try {
        setIsChangingVariant(true);

        const deleteResponse = await deleteOrderProduct({
          variables: { id: lineId },
        });
        const deleteErrors =
          deleteResponse?.data?.orderLineDelete?.errors || [];
        if (deleteErrors.length > 0) throw new Error(deleteErrors[0].message);

        const addResponse = await orderLineAddMutation({
          variables: {
            id: order_id,
            input: [{ variantId: newVariantId, quantity }],
          },
        });
        const addErrors = addResponse?.data?.orderLinesCreate?.errors || [];
        if (addErrors.length > 0) throw new Error(addErrors[0].message);

        toast.success("Variant updated successfully");
        await fetchOrderData(true);
      } catch (err) {
        toast.error(err.message || "Failed to change variant");
      } finally {
        setIsChangingVariant(false);
      }
    },
    [
      order_id,
      deleteOrderProduct,
      orderLineAddMutation,
      fetchOrderData,
      isChangingVariant,
    ],
  );

  const deleteProduct = async (id) => {
    if (!id || isUIBusy) {
      toast.warning("Product ID not found");
      return;
    }
    try {
      setLocalLoading(true);
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
    } finally {
      setLocalLoading(false);
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
    if (isUIBusy) return;
    try {
      const availableMethods =
        shippingMethodData?.channel?.availableShippingMethodsPerCountry?.[0]
          ?.shippingMethods;
      const shippingMethodId = availableMethods?.[0]?.id ?? null;

      if (!shippingMethodId) {
        toast.error("No shipping methods available for this region.");
        return;
      }

      await toast.promise(
        (async () => {
          const shippingResponse = await updateShippingMethod({
            variables: {
              id: order_id,
              input: { shippingMethod: shippingMethodId },
            },
          });

          const shippingErrors =
            shippingResponse?.data?.orderUpdateShipping?.errors ?? [];
          if (shippingErrors.length > 0)
            throw new Error(shippingErrors[0].message);

          const finalizeResponse = await orderDraftFinalize({
            variables: {
              id: order_id,
              date: formattedDate,
              slot: selectedSlot,
            },
          });

          const finalErrors =
            finalizeResponse?.data?.draftOrderComplete?.errors ?? [];
          if (finalErrors.length > 0) throw new Error(finalErrors[0].message);

          return finalizeResponse;
        })(),
        {
          loading: "Processing & Confirming order...",
          success: () => {
            setShowSuccess(true);
            animationRef.current?.play();
            setTimeout(() => {
              setGlobalRefresh(true);
              navigation.goBack();
            }, 2000);
            return "Order confirmed successfully!";
          },
          error: (err) => err?.message || "Failed to process order.",
        },
      );
    } catch (err) {
      toast.error("Unexpected Error Occurred");
    }
  }, [
    token,
    selectedDate,
    formattedDate,
    selectedSlot,
    order_id,
    shippingMethodData,
    updateShippingMethod,
    orderDraftFinalize,
    isUIBusy,
  ]);

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
      toast.error("Failed to cancel order");
    } finally {
      setLocalLoading(false);
    }
  }, [order_id]);

  const cancelDraft = useCallback(async (id) => {
    if (!id) return toast.error("Order ID is missing");
    try {
      const { data } = await orderDraftCancel({ variables: { id } });
      const errors = data?.draftOrderDelete?.errors || [];
      if (errors.length > 0) throw new Error(errors[0]?.message);
      toast.success("Draft order cancelled successfully");
      setGlobalRefresh(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      toast.error(err.message || "Failed to cancel draft order");
    }
  }, []);

  const handleConfirmCancel = () => {
    setCancelModalVisible(false);
    cancellationOrder ? cancelOrder() : cancelDraft(order_id);
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

  const handleAIPromptSubmit = async () => {
    const textToSubmit = aiPromptTextRef.current;

    if (!textToSubmit.trim())
      return toast.warning("Please enter an order prompt");

    try {
      setAiLoading(true);

      const data = await AIOrderPrompt({
        body: { text: textToSubmit },
      }).unwrap();

      if (data.status === "ok" && data.orders?.length > 0) {
        const parsedOrder = data.orders[0];

        if (parsedOrder.unmatched_items?.length > 0) {
          const missingItems = parsedOrder.unmatched_items
            .map((item) => {
              const displayName =
                item.product_name || item.raw_text?.trim() || "Unknown Item";
              return `• ${displayName}`;
            })
            .join("\n");

          // REPLACE Alert.alert with Custom Modal trigger
          setUnmatchedItemsText(missingItems);
          setUnmatchedModalVisible(true);
        }

        const linesToAdd = parsedOrder.order_lines.map((line) => ({
          variantId: line.variantId,
          quantity: line.quantity,
        }));

        if (linesToAdd.length > 0) {
          const { data: addData } = await orderLineAddMutation({
            variables: { id: order_id, input: linesToAdd },
          });
          const errors = addData?.orderLinesCreate?.errors || [];
          if (errors.length > 0) throw new Error(errors[0].message);

          toast.success(`Successfully added ${linesToAdd.length} items!`);
          await fetchOrderData(true);
        } else {
          toast.error("No valid products matched from your prompt.");
        }

        const parsedCustomer = parsedOrder.customer;

        if (parsedCustomer?.phone) {
          toast.info("Auto-assigning customer...");
          const phoneQuery = parsedCustomer.phone.replace(/\s+/g, "");

          const { data: customerSearchData } = await searchCustomers({
            variables: { first: 5, query: phoneQuery, after: null },
          });

          const foundCustomers = customerSearchData?.search?.edges || [];

          if (foundCustomers.length > 0) {
            const selectedCustomer = foundCustomers[0].node;
            await updateOrderDraft({
              variables: { id: order_id, input: { user: selectedCustomer.id } },
            });

            const { data: customerAddressData } = await singleCustomerAddresses(
              {
                variables: { id: selectedCustomer.id },
              },
            );

            const customerAddresses =
              customerAddressData?.user?.addresses || [];

            if (customerAddresses.length > 0) {
              let addressToUse = customerAddresses[0];

              if (parsedCustomer.address_hint) {
                const hint = parsedCustomer.address_hint.toLowerCase();
                const matchedAddress = customerAddresses.find((a) =>
                  a.streetAddress1?.toLowerCase().includes(hint),
                );
                if (matchedAddress) addressToUse = matchedAddress;
              }

              const payload = {
                firstName: addressToUse.firstName,
                lastName: addressToUse.lastName,
                phone: addressToUse.phone,
                streetAddress1: addressToUse.streetAddress1,
                city: addressToUse.city,
                postalCode: addressToUse.postalCode,
                country: addressToUse.country.code,
                countryArea: "Maharashtra",
              };

              await updateOrderDraft({
                variables: {
                  id: order_id,
                  input: { billingAddress: payload, shippingAddress: payload },
                },
              });

              const { data: sData } = await getShippingMethods({
                variables: { id: order_id },
              });
              const sMethodId = sData?.order?.shippingMethods?.[0]?.id;
              if (sMethodId) {
                await updateShippingMethod({
                  variables: {
                    id: order_id,
                    input: { shippingMethod: sMethodId },
                  },
                });
              }
            }

            setSelectedCustomerData(selectedCustomer);
            toast.success(
              `Customer ${selectedCustomer.firstName} assigned automatically`,
            );
          } else {
            toast.warning(
              `No customer profile found for ${parsedCustomer.phone}`,
            );
          }
        }

        aiPromptTextRef.current = "";
        promptInputRef.current?.clear();
        setAiModalVisible(false);
      } else {
        toast.error("Failed to parse order from text.");
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          error.message ||
          "Failed to process the AI prompt.",
      );
    } finally {
      setAiLoading(false);
    }
  };

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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: theme.background }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {cancellationOrder ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                padding: 10,
                gap: 8,
              }}
            >
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {orderStatus || "Loading Status..."}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (cancelLoading || isUIBusy) && { opacity: 0.5 },
                ]}
                onPress={() => setCancelModalVisible(true)}
                disabled={cancelLoading || isUIBusy}
              >
                <Text style={styles.buttonText}>
                  {cancelLoading || localLoading ? "Cancelling..." : "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  (isCancelling || isUIBusy) && { opacity: 0.5 },
                ]}
                onPress={() => setCancelModalVisible(true)}
                disabled={isCancelling || isUIBusy}
              >
                <Text style={styles.buttonText}>
                  {isCancelling ? "Cancelling..." : "Cancel Order"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isUIBusy && { opacity: 0.5 }]}
                onPress={toggleBottomSheet}
                disabled={isUIBusy}
              >
                <Text style={styles.buttonText}>Add Product</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isUIBusy && { opacity: 0.5 }]}
                onPress={() => setAiModalVisible(true)}
                disabled={isUIBusy}
              >
                <Text style={styles.buttonText}>AI Order Prompt</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.safeAreaView}>
            {fetchMetaDataLoading ? (
              <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                {[...Array(2)].map((_, index) => (
                  <View key={index} style={styles.shimmerCard}>
                    <ShimmerPlaceholder
                      height={30}
                      width="60%"
                      borderRadius={6}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                {error && <ErrorMessage errorMessage={error.message} />}
                <OrderTable
                  orderLines={orderLines}
                  onDeleteProduct={deleteProduct}
                  onUpdateQuantity={updateQuantity}
                  onChangeVariant={changeVariant}
                  isChangingVariant={isChangingVariant}
                  isEditable={
                    !cancellationOrder || orderStatus === "UNCONFIRMED"
                  }
                  tableConfig={!cancellationOrder}
                />
              </View>
            )}

            {!cancellationOrder && (
              <View style={{ backgroundColor: theme.background }}>
                <TouchableOpacity
                  style={[styles.selectionInput, isUIBusy && { opacity: 0.6 }]}
                  disabled={isUIBusy}
                  onPress={() => {
                    if (orderWithMetaData.length > 0) setCustomerVisible(true);
                    else
                      toast.warning(
                        "Please add product before selecting a customer.",
                      );
                  }}
                >
                  <TextInput
                    placeholder="Select Customer Address"
                    placeholderTextColor={theme.secondary}
                    style={styles.selectionText}
                    editable={false}
                    value={
                      selectedCustomerData?.firstName &&
                      selectedCustomerData?.lastName
                        ? `${selectedCustomerData.firstName} ${selectedCustomerData.lastName}`
                        : ""
                    }
                  />
                  <Icon
                    name="chevron-down-outline"
                    size={20}
                    color={theme.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectionInput, isUIBusy && { opacity: 0.6 }]}
                  disabled={isUIBusy}
                  onPress={() => setShowPicker(true)}
                >
                  <TextInput
                    placeholder="Select Order Date"
                    placeholderTextColor={theme.secondary}
                    style={styles.selectionText}
                    editable={false}
                    value={formattedDate}
                  />
                  <Icon
                    name="chevron-down-outline"
                    size={20}
                    color={theme.text}
                  />
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    mode="date"
                    display="default"
                    value={selectedDate}
                    onChange={onChangeDate}
                  />
                )}

                <TouchableOpacity
                  style={[styles.selectionInput, isUIBusy && { opacity: 0.6 }]}
                  disabled={isUIBusy}
                  onPress={showModal}
                >
                  <TextInput
                    placeholder="Available Slots"
                    placeholderTextColor={theme.secondary}
                    style={styles.selectionText}
                    editable={false}
                    value={selectedSlot}
                  />
                  <Icon
                    name="chevron-down-outline"
                    size={20}
                    color={theme.text}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    (isFinalizing || isUIBusy) && { opacity: 0.6 },
                  ]}
                  onPress={() => setConfirmOrderModalVisible(true)}
                  disabled={isFinalizing || isUIBusy}
                >
                  {isFinalizing || localLoading ? (
                    <ActivityIndicator color={theme.background} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Customer Bottom Sheet */}
      {customerVisible && (
        <BottomSheet
          addCustomer={true}
          paddingBottom={20}
          fontStyle="normal"
          backgroundColor={theme.primary}
          fontSize={22}
          title="Customer list"
          height={SCREEN_HEIGHT * 0.5}
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

      {/* Product List Bottom Sheet */}
      {isVisible && (
        <BottomSheet
          paddingBottom={20}
          fontStyle="normal"
          fontSize={22}
          title="Product list"
          height={SCREEN_HEIGHT * 0.8}
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
        {/* Available Slots Modal */}
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

        {/* Cancel Confirmation Modal */}
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

        {/* Place Order Confirmation Modal */}
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

        {/* CUSTOM UNMATCHED ITEMS MODAL */}
        <Modal
          visible={unmatchedModalVisible}
          onDismiss={() => setUnmatchedModalVisible(false)}
          contentContainerStyle={[styles.modalContainer, { maxHeight: "80%" }]}
        >
          <Text className="text-orange-500 font-bold text-xl ">
            Warning: Items Not Found
          </Text>

          <Text style={{ fontSize: 15, marginBottom: 15, color: theme.text }}>
            The AI could not find or process the following items in your
            catalog. Please add them manually if needed:
          </Text>

          {/* ScrollView limits height for massive lists */}
          <ScrollView
            style={{ maxHeight: 200, marginBottom: 20, paddingHorizontal: 5 }}
            showsVerticalScrollIndicator={true}
          >
            <Text
              style={{ fontSize: 15, color: theme.secondary, lineHeight: 24 }}
            >
              {unmatchedItemsText}
            </Text>
          </ScrollView>

          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity
              style={{ paddingHorizontal: 15, paddingVertical: 5 }}
              onPress={() => setUnmatchedModalVisible(false)}
            >
              <Text
                style={{
                  color: theme.textSecondary || "#4ade80",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* AI Prompt Modal */}
        <Modal
          visible={aiModalVisible}
          dismissable={!aiLoading}
          onDismiss={() => {
            if (!aiLoading) {
              setAiModalVisible(false);
              aiPromptTextRef.current = "";
              promptInputRef.current?.clear();
            }
          }}
          contentContainerStyle={[styles.modalContainer, { maxHeight: "90%" }]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flexShrink: 1 }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 15,
                  color: theme.text,
                }}
              >
                AI Order Prompt
              </Text>

              {isUIBusy ? (
                <View
                  style={{
                    paddingVertical: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator
                    size="large"
                    color={theme.deliveryDate || "#4ade80"}
                  />
                  <Text
                    style={{
                      marginTop: 15,
                      fontSize: 15,
                      color: theme.text,
                      textAlign: "center",
                    }}
                  >
                    Processing AI Prompt...{"\n"}Mapping products & assigning
                    customer.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    ref={promptInputRef}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.secondary,
                      borderRadius: 8,
                      padding: 12,
                      color: theme.text,
                      minHeight: 120,
                      maxHeight: 220,
                      textAlignVertical: "top",
                      marginBottom: 20,
                      backgroundColor: theme.background,
                    }}
                    multiline
                    scrollEnabled={true}
                    placeholder="e.g., Bhendi - 500 gm&#10;Tomato - 1.5 kg..."
                    placeholderTextColor={theme.secondary}
                    defaultValue={aiPromptTextRef.current}
                    onChangeText={(text) => {
                      aiPromptTextRef.current = text;
                    }}
                    editable={!aiLoading}
                    autoCorrect={false}
                    spellCheck={false}
                    autoCapitalize="none"
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setAiModalVisible(false);
                        aiPromptTextRef.current = "";
                        promptInputRef.current?.clear();
                      }}
                      disabled={aiLoading}
                    >
                      <Text
                        style={{
                          color: theme.secondary,
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleAIPromptSubmit}
                      disabled={aiLoading}
                    >
                      <Text
                        style={{
                          color: theme.textSecondary || "#4ade80",
                          fontWeight: "600",
                          fontSize: 16,
                        }}
                      >
                        Submit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}
