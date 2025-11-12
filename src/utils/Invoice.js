// utils/invoiceUtils.js (React Native CLI version)
import RNFetchBlob from "react-native-blob-util";
import Share from "react-native-share";
import { toast } from "sonner-native";
import { client } from "../client/client";
import { CONFIRM_ORDER_MUTATION, GENERATE_INVOICE } from "../graphql/Mutation";

/**
 * Download and share an invoice file (PDF) using native modules.
 */
export const downloadAndShareInvoice = async (invoiceUrl) => {
  if (typeof invoiceUrl !== "string" || !invoiceUrl.startsWith("http")) {
    throw new Error(`Invalid invoice URL: ${invoiceUrl}`);
  }

  const filename = `invoice_${Date.now()}.pdf`;
  const path = `${RNFetchBlob.CachesDirectoryPath}/${filename}`;

  // Download file to cache directory
  const downloadResult = await RNFetchBlob.downloadFile({
    fromUrl: invoiceUrl,
    toFile: path,
  }).promise;

  if (downloadResult.statusCode !== 200) {
    throw new Error("Failed to download invoice file");
  }

  // Share the downloaded file
  await Share.open({
    url: `file://${path}`,
    type: "application/pdf",
    showAppsToView: true,
    title: "Share Invoice",
  });
};

/**
 * Confirm an order if needed, generate an invoice, and share the PDF.
 */
export const generateAndShareInvoice = async (
  order_id,
  status,
  refetchOrder
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
    await downloadAndShareInvoice(invoiceUrl);
  } catch (error) {
    toast.error(error.message || "Invoice generation failed");
    throw error;
  }
};
