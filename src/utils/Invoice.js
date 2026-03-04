// utils/invoiceUtils.js (React Native CLI version)
import RNFetchBlob from "react-native-blob-util";
import Share from "react-native-share"; // Ensure this matches your installed version
import { toast } from "sonner-native";
// Adjust these imports to match your project structure if needed
import { client } from "./../client/client";
import {
  CONFIRM_ORDER_MUTATION,
  GENERATE_INVOICE,
} from "./../graphql/Mutation";

// utils/invoiceUtils.js

const downloadAndShareInvoice = async (invoiceUrl) => {
  if (typeof invoiceUrl !== "string" || !invoiceUrl.startsWith("http")) {
    throw new Error(`Invalid invoice URL: ${invoiceUrl}`);
  }

  const { config, fs } = RNFetchBlob;
  const filename = `invoice_${Date.now()}.pdf`;
  const path = `${fs.dirs.CacheDir}/${filename}`;

  try {
    // FIX: Remove 'addAndroidDownloads' to allow writing to CacheDir
    const res = await config({
      fileCache: true,
      path: path,
    }).fetch("GET", invoiceUrl);

    // Check status
    const status = res.info().status;
    if (status !== 200) {
      throw new Error(`Failed to download invoice (Status: ${status})`);
    }

    // Share the file
    // Note: react-native-share handles file:// paths from internal cache automatically
    await Share.open({
      url: `file://${res.path()}`,
      type: "application/pdf",
      title: "Share Invoice",
      failOnCancel: false,
    });
  } catch (error) {
    console.error("Download Error:", error);
    throw error;
  }
};

/**
 * Confirm an order if needed, generate an invoice, and share the PDF.
 */
export const generateAndShareInvoice = async (
  order_id,
  status,
  refetchOrder,
) => {
  try {
    if (!order_id) throw new Error("Order ID not found");
    if (!status) throw new Error("Order status not found");

    // Step 1: Confirm order if unconfirmed
    if (status === "UNCONFIRMED") {
      const confirmResponse = await client.mutate({
        mutation: CONFIRM_ORDER_MUTATION,
        variables: { id: order_id },
        fetchPolicy: "no-cache",
      });

      const confirmErrors = confirmResponse.data?.orderConfirm?.errors || [];
      if (confirmErrors.length > 0) throw new Error(confirmErrors[0].message);

      toast.success("Order confirmed successfully");

      if (refetchOrder) {
        // Wait briefly for server to process before refetching
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await refetchOrder(true);
      }
    }

    // Step 2: Generate invoice
    const invoiceResponse = await client.mutate({
      mutation: GENERATE_INVOICE,
      variables: { orderId: order_id },
    });

    const invoiceErrors = invoiceResponse.data?.invoiceRequest?.errors || [];
    if (invoiceErrors.length > 0) throw new Error(invoiceErrors[0].message);

    const invoiceUrl = invoiceResponse.data?.invoiceRequest?.invoice?.url;
    if (!invoiceUrl) throw new Error("No invoice URL returned");

    // Step 3: Download & share invoice
    // This calls the fixed local function above
    await downloadAndShareInvoice(invoiceUrl);
  } catch (error) {
    // Only show toast if it's not a user cancellation (handled in downloadAndShareInvoice via failOnCancel)
    if (error.message !== "User did not share") {
      toast.error(error.message || "Invoice generation failed");
    }
    // We log it but don't necessarily re-throw if we handled the UI feedback
    console.log("Invoice Flow Error:", error);
  }
};
