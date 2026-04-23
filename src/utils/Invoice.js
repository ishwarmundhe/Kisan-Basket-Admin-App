import RNFetchBlob from "react-native-blob-util";
import Share from "react-native-share";
import { toast } from "sonner-native";
import { client } from "./../client/client";
import {
  CONFIRM_ORDER_MUTATION,
  GENERATE_INVOICE,
} from "./../graphql/Mutation";

const downloadAndShareInvoice = async (invoiceUrl) => {
  if (typeof invoiceUrl !== "string" || !invoiceUrl.startsWith("http")) {
    throw new Error(`Invalid invoice URL: ${invoiceUrl}`);
  }

  const { config, fs } = RNFetchBlob;
  const filename = `invoice_${Date.now()}.pdf`;
  const path = `${fs.dirs.CacheDir}/${filename}`;

  try {
    const res = await config({
      fileCache: true,
      path: path,
    }).fetch("GET", invoiceUrl);

    const status = res.info().status;
    if (status !== 200) {
      throw new Error(`Failed to download invoice (Status: ${status})`);
    }

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

export const generateAndShareInvoice = async (
  order_id,
  status,
  refetchOrder,
) => {
  try {
    if (!order_id) throw new Error("Order ID not found");
    if (!status) throw new Error("Order status not found");

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

    const invoiceResponse = await client.mutate({
      mutation: GENERATE_INVOICE,
      variables: { orderId: order_id },
    });

    const invoiceErrors = invoiceResponse.data?.invoiceRequest?.errors || [];
    if (invoiceErrors.length > 0) throw new Error(invoiceErrors[0].message);

    const invoiceUrl = invoiceResponse.data?.invoiceRequest?.invoice?.url;
    if (!invoiceUrl) throw new Error("No invoice URL returned");

    await downloadAndShareInvoice(invoiceUrl);
  } catch (error) {
    if (error.message !== "User did not share") {
      toast.error(error.message || "Invoice generation failed");
    }
  }
};
