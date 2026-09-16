-- Razorpay Payment Links: an alternative to the in-page Checkout popup.
-- The customer is sent to a Razorpay-hosted page (always HTTPS, on Razorpay's own
-- domain), which means the app itself does not need a TLS certificate to take money.

-- AlterTable
ALTER TABLE `payment_orders`
    ADD COLUMN `razorpayPaymentLinkId` VARCHAR(80) NULL,
    ADD COLUMN `shortUrl` VARCHAR(500) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `payment_orders_razorpayPaymentLinkId_key` ON `payment_orders`(`razorpayPaymentLinkId`);
