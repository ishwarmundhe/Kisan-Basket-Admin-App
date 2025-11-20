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
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
  BackHandler,
  // SafeAreaView,
} from "react-native";
import LottieView from "lottie-react-native";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client/react";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Modal, Portal, PaperProvider } from "react-native-paper";
import { toast } from "sonner-native";
import ShimmerPlaceholder from "../../../components/custom/shimmerLoaderPlaceholder";
// Components
import CustomerList from "../../../components/custom/customerList";
import BottomSheetProductListContent from "../../../components/custom/bottomSheetProductList";
import BottomSheet from "../../../components/custom/CustomBottomSheet";
import ErrorMessage from "../../../components/custom/errorMessage";
import { DataTable } from "react-native-paper";

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
} from "../../../graphql/Mutation";

// Services & Context
import { AuthContext } from "../../../constant/AuthProvider";
import { GetOrderSlots } from "../../../axiosServices/services";
import { colors } from "../../../constant/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../constant/ThemeContext";
import { useStyle } from "./component/UseStyle";
// Constants
import OrderTable from "./component/OrderTable";

const TABLE_COLUMNS = [
  { key: "sno", label: "S/No", width: 20 },
  { key: "product", label: "Product", width: 120 },
  { key: "variant", label: "Variant", width: 120 },
  { key: "quantity", label: "Quantity", width: 120 },
  { key: "price", label: "Price", width: 120 },
  { key: "total", label: "Total", width: 120 },
  { key: "delete", label: "Delete", width: 120 },
];

export default function OrderSummaryScreen({ navigation, route }) {
  const { theme } = useTheme();
  // Context and route params
  const { token } = useContext(AuthContext);
  const { order_id, cancellationOrder = false } = route?.params || {};
  const { setGlobalRefresh } = useContext(AuthContext);

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
  const [countdown, setCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productList, setProductList] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [backConfirmVisible, setBackConfirmVisible] = useState(false);

  // Date management
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow;
  });

  // GraphQL operations
  const [orderDraftFinalize] = useMutation(ORDER_DRAFT_FINALIZE);
  const [fetchOrderDetails, { isLoading: fetchMetaDataLoading }] = useLazyQuery(
    ORDER_DETAILS_WITH_METADATA
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

  const styles = useStyle(theme);

  console.log("searchData", JSON.stringify(searchData));

  // const formattedDate = selectedDate.toISOString().split("T")[0];
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
    [orderWithMetaData]
  );

  // Handlers
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
    [initialData, searchProducts]
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
    [cancellationOrder, order_id]
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
      console.log("result -->", orderSlotResult);
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
    [selectedDate, formattedDate]
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
        }
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
        navigation.goBack();
      } else {
        toast.error("Order cancel failed");
      }
    } catch (err) {
      toast.error("Failed to confirm order");
    } finally {
      setLocalLoading(false);
    }
  }, [order_id]);

  // const cancelDraft = useCallback(async (id) => {
  //   if (!id) {
  //     toast.error("Order ID is missing");
  //     return;
  //   }

  //   try {
  //     const { data } = await orderDraftCancel({ variables: { id: id } });
  //     const errors = data?.draftOrderDelete?.errors || [];

  //     if (errors.length > 0) {
  //       throw new Error(errors[0]?.message || "Failed to cancel draft order");
  //     }

  //     toast.success("Draft order cancelled successfully");
  //     setTimeout(() => navigation.goBack(), 1000);
  //   } catch (err) {
  //     toast.error(err.message || "Failed to cancel draft order");
  //   }
  // }, [order_id]);
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
      setTimeout(() => navigation.goBack(), 1000);
    } catch (err) {
      toast.error(err.message || "Failed to cancel draft order");
    }
  }, []);

  const toggleBottomSheet = useCallback(
    () => setIsVisible((prev) => !prev),
    []
  );
  const showModal = useCallback(() => setVisible(true), []);
  const hideModal = useCallback(() => setVisible(false), []);
  const CancelBottomSheet = useCallback(() => {
    setIsVisible(false);
    setCustomerVisible(false);
  }, []);

  // Effects
  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  useEffect(() => {
    if (!cancellationOrder) orderSlotQuery();
  }, [cancellationOrder, orderSlotQuery]);

  useEffect(() => {
    // If there is a search query, use searchData
    if (searchQuery && searchData) {
      setProductList(searchData.products?.edges || []);
    }
    // If no search query, use initialData
    else if (!searchQuery && initialData) {
      setProductList(initialData.products?.edges || []);
    }
  }, [initialData, searchData, searchQuery]);

  // Render functions
  const renderItem = useCallback(({ item, index }) => {
    const total = item.amount * item.quantity;
    return (
      <View style={styles.row}>
        <Text style={[styles.numberCell, styles.headerCell]}>{index + 1}</Text>
        <Text style={styles.cell}>{item.productName}</Text>
        <Text style={styles.cell}>{item.variantName}</Text>
        <Text style={styles.cell}>{item.quantity}</Text>
        <Text style={styles.cell}>
          {item.amount} {item.currency}
        </Text>
        <Text style={styles.cell}>
          {total} {item.currency}
        </Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteProduct(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#941B00" />
        </TouchableOpacity>
      </View>
    );
  }, []);

  const renderHeader = useCallback(
    () => (
      <View style={[styles.row, styles.headerRow]}>
        {TABLE_COLUMNS.map((column) => (
          <Text
            key={column.key}
            style={[
              column.key === "sno" ? styles.numberCell : styles.cell,
              styles.headerCell,
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
    ),
    []
  );

  const renderEmptyState = useCallback(
    () => <Text style={styles.emptyText}>No products added yet.</Text>,
    []
  );

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
            <TouchableOpacity
              style={[styles.modalButton, { flex: 1 }]}
              onPress={hideModal}
            >
              <Text style={styles.confirmButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { flex: 1 }]}
              onPress={hideModal}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    ),
    [visible, orderSlots, selectedSlot]
  );

  const renderSuccessAnimation = useCallback(
    () => (
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require("../../../assets/animation/Success.json")}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </View>
    ),
    []
  );

  const renderCustomerBottomSheet = useCallback(
    () => (
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
        onPress={() => navigation.navigate("createCustomer")}
      >
        <CustomerList
          customerPersonalInfo={setSelectedCustomerData}
          order_id={order_id}
          CancelBottomSheet={CancelBottomSheet}
        />
      </BottomSheet>
    ),
    [customerVisible, order_id]
  );

  const renderProductBottomSheet = useCallback(
    () => (
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
    ),
    [isVisible, productList, order_id, isLoading, searchQuery]
  );

  const renderActionButtons = useCallback(() => {
    if (cancellationOrder) {
      return (
        <View style={styles.actionButtonContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{orderStatus}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={cancelOrder}>
            <Text style={{ color: theme.text }}>
              {cancelLoading || localLoading ? "Cancelling" : "Cancel"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => cancelDraft(order_id)}
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
          placeholderTextColor={theme.text}
          style={styles.selectionText}
          editable={false}
          value={
            selectedCustomerData?.firstName && selectedCustomerData?.lastName
              ? `${selectedCustomerData.firstName} ${selectedCustomerData.lastName}`
              : ""
          }
        />
        <Icon name="chevron-down-outline" size={25} color={theme.text} />
      </TouchableOpacity>
    ),
    [orderWithMetaData.length, selectedCustomerData]
  );

  const renderDateSelection = useCallback(
    () => (
      <TouchableOpacity
        style={styles.selectionInput}
        onPress={() => setShowPicker(true)}
      >
        <TextInput
          placeholder="Select Order Date"
          placeholderTextColor={theme.text}
          style={styles.selectionText}
          editable={false}
          value={formattedDate}
        />
        <Icon name="chevron-down-outline" size={25} color={theme.text} />
      </TouchableOpacity>
    ),
    [formattedDate, selectedDate]
  );

  const renderSlotSelection = useCallback(
    () => (
      <TouchableOpacity style={styles.selectionInput} onPress={showModal}>
        <TextInput
          placeholder="Available Slots"
          placeholderTextColor={theme.text}
          style={styles.selectionText}
          editable={false}
          value={selectedSlot}
        />
        <Icon name="chevron-down-outline" size={25} color={theme.text} />
      </TouchableOpacity>
    ),
    [selectedSlot, selectedDate]
  );

  const renderLoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.shimmerCard}>
          <ShimmerPlaceholder height={30} width="60%" borderRadius={6} />
          <ShimmerPlaceholder height={20} width="60%" borderRadius={6} />
          <View style={{ marginTop: 5 }}>
            <ShimmerPlaceholder height={16} width="80%" borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );

  useEffect(() => {
    const backAction = () => {
      setBackConfirmVisible(true);
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => subscription.remove();
  }, []);

  const confirmBack = async (id) => {
    try {
      await cancelDraft(id);
      //  setTimeout(()=> {
      //   navigation.goBack();
      //  },[1000])
    } catch (err) {
      toast.error("Failed to cancel draft before leaving.");
    } finally {
      setBackConfirmVisible(false);
    }
  };

  const cancelBack = () => {
    setBackConfirmVisible(false);
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {localLoading || fetchMetaDataLoading ? (
          renderLoadingSkeleton()
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            {error && <ErrorMessage errorMessage={error.message} />}
            {renderActionButtons()}
            {/* {orderWithMetaData.length > 0 ? (
                <View>
                  {renderHeader()}
                  <FlatList
                    data={orderLines}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmptyState}
                  />
                </View>
              ) : (
                renderEmptyState()
              )} */}
            <ScrollView contentContainerStyle={styles.container}>
              <OrderTable
                orderLines={orderLines}
                onDeleteProduct={deleteProduct}
              />
            </ScrollView>
          </ScrollView>
        )}
        {!cancellationOrder && (
          <View>
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
              style={styles.confirmButton}
              onPress={ConfirmOrder}
            >
              <Text style={styles.confirmButtonText}>Confirm Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderSlotModal()}
        {showSuccess && renderSuccessAnimation()}
      </SafeAreaView>
      {customerVisible && renderCustomerBottomSheet()}
      {isVisible && renderProductBottomSheet()}
      <Portal>
        <Modal
          visible={backConfirmVisible}
          onDismiss={cancelBack}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 16, marginBottom: 20 }}>
            Are you sure you want to go back? Your draft order will be
            cancelled.
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={cancelBack} style={{ marginRight: 30 }}>
              <Text style={{ color: "gray" }}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmBack(order_id)}>
              <Text style={{ color: "red" }}>Yes</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </PaperProvider>
  );
}
