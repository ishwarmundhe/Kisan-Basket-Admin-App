import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "@apollo/client";
import {
  CONFIRM_ORDER_MUTATION,
  GENERATE_INVOICE,
} from "../../graphql/Mutation";
import { toast } from "sonner-native";
import { colors } from "../../constant/Colors";
import { FAB } from "react-native-paper";
import RNFetchBlob from "react-native-blob-util";

import Share from "@react-native-share/share";
import { useTheme } from "../../constant/ThemeContext";

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        generateInvoice: {
          paddingHorizontal: 10,
          paddingVertical: 10,
          flex: 1,
          flexDirection: "row",
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 20,
          backgroundColor: theme.primary,
          borderWidth: 1.2,
          borderColor: theme.border,
          borderRadius: 8,
          justifyContent: "center",
          alignItems: "center",
        },
        fab: { backgroundColor: theme.primary },
        disabledButton: { opacity: 0.6 },
      }),
    [theme]
  );

const GenerateCustomerInvoice = ({ order_id, status, refetchOrder }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [confirmOrderMutation, { loading: isConfirming }] = useMutation(
    CONFIRM_ORDER_MUTATION
  );
  const [generateCustomerInvoice, { loading: isGenerating }] =
    useMutation(GENERATE_INVOICE);

  const generateInvoiceHandler = async () => {
    if (!order_id) return toast.warning("Order ID not found");
    if (!status) return toast.warning("Order status not found");

    try {
      // Step 1: Confirm order if needed
      if (status === "UNCONFIRMED") {
        const confirmRes = await confirmOrderMutation({
          variables: { id: order_id },
          fetchPolicy: "no-cache",
        });
        const confirmErrors = confirmRes.data?.orderConfirm?.errors || [];
        if (confirmErrors.length) throw new Error(confirmErrors[0].message);

        toast.success("Order confirmed successfully");
        await new Promise((r) => setTimeout(r, 1500));
        if (refetchOrder) await refetchOrder(true);
      }

      // Step 2: Generate invoice
      const invoiceRes = await generateCustomerInvoice({
        variables: { orderId: order_id },
      });
      const invoiceErrors = invoiceRes.data?.invoiceRequest?.errors || [];
      if (invoiceErrors.length) throw new Error(invoiceErrors[0].message);

      const invoiceUrl = invoiceRes.data?.invoiceRequest?.invoice?.url;
      if (!invoiceUrl) throw new Error("No invoice URL returned");

      await downloadAndShareInvoice(invoiceUrl);
    } catch (err) {
      toast.error(err.message || "Invoice process failed");
    }
  };

  const downloadAndShareInvoice = async (invoiceUrl) => {
    if (typeof invoiceUrl !== "string" || !invoiceUrl.startsWith("http")) {
      throw new Error(`Invalid invoice URL: ${invoiceUrl}`);
    }

    const filename = `invoice_${Date.now()}.pdf`;
    const path = `${RNFetchBlob.CachesDirectoryPath}/${filename}`;

    try {
      const downloadRes = await RNFetchBlob.downloadFile({
        fromUrl: invoiceUrl,
        toFile: path,
      }).promise;

      if (downloadRes.statusCode !== 200)
        throw new Error("Failed to download invoice");

      await Share.open({
        url: `file://${path}`,
        type: "application/pdf",
        showAppsToView: true,
        title: "Share Invoice",
      });
    } catch (e) {
      throw e;
    }
  };

  const isLoading = isConfirming || isGenerating;

  return (
    <TouchableOpacity
      style={[styles.generateInvoice, isLoading && styles.disabledButton]}
      onPress={generateInvoiceHandler}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.HEADING_COLOR} />
      ) : (
        <>
          <Text style={{ color: colors.HEADING_COLOR, fontWeight: "600" }}>
            Download Invoice
          </Text>
          <FAB
            icon="download-outline"
            style={styles.fab}
            size="small"
            color={colors.HEADING_COLOR}
          />
        </>
      )}
    </TouchableOpacity>
  );
};

export default GenerateCustomerInvoice;
