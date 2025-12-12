import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  autoDeliverGiftCards,
  notifyManualDelivery,
  sendOrderConfirmation,
  sendCodeDelivery,
  sendPaymentVerified,
  sendPaymentRejected,
} from "@/inngest/functions";

// Serve all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // User sync functions
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    // Gift card delivery functions
    autoDeliverGiftCards,
    notifyManualDelivery,
    // Email notification functions
    sendOrderConfirmation,
    sendCodeDelivery,
    sendPaymentVerified,
    sendPaymentRejected,
  ],
});
