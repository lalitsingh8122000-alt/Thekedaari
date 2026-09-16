-- Subscription module: plans, granted access windows, and Razorpay payment orders.
--
-- The paywall applies to EVERY account, existing ones included: this migration grants
-- nobody any access. After it runs, extend whichever users you want by hand --
--   node scripts/bulk-extend-users.js --days 60 --apply      (all existing accounts)
--   node scripts/grant-subscription.js <phone> --months 2    (one account)
-- See SUBSCRIPTION_SETUP.md section 2.

-- AlterTable: access fields on User
ALTER TABLE `User`
    ADD COLUMN `planExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `planStatus` VARCHAR(20) NOT NULL DEFAULT 'none',
    ADD COLUMN `isLegacyUser` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `currentPlanCode` VARCHAR(40) NULL;

-- CreateIndex
CREATE INDEX `User_planExpiresAt_idx` ON `User`(`planExpiresAt`);

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(40) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `nameHi` VARCHAR(80) NOT NULL,
    `tagline` VARCHAR(200) NULL,
    `taglineHi` VARCHAR(200) NULL,
    `months` INTEGER NOT NULL DEFAULT 0,
    `durationDays` INTEGER NOT NULL DEFAULT 0,
    `priceInPaise` INTEGER NOT NULL,
    `mrpInPaise` INTEGER NOT NULL,
    `badge` VARCHAR(40) NULL,
    `badgeHi` VARCHAR(40) NULL,
    `highlight` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_plans_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
    `planCode` VARCHAR(40) NOT NULL,
    `amountInPaise` INTEGER NOT NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'INR',
    `receipt` VARCHAR(60) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'created',
    `provider` VARCHAR(20) NOT NULL DEFAULT 'razorpay',
    `razorpayOrderId` VARCHAR(80) NULL,
    `razorpayPaymentId` VARCHAR(80) NULL,
    `razorpaySignature` VARCHAR(255) NULL,
    `method` VARCHAR(30) NULL,
    `failureReason` VARCHAR(255) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_orders_receipt_key`(`receipt`),
    UNIQUE INDEX `payment_orders_razorpayOrderId_key`(`razorpayOrderId`),
    INDEX `payment_orders_userId_idx`(`userId`),
    INDEX `payment_orders_status_idx`(`status`),
    INDEX `payment_orders_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NULL,
    `planCode` VARCHAR(40) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `source` VARCHAR(20) NOT NULL DEFAULT 'razorpay',
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `amountInPaise` INTEGER NOT NULL DEFAULT 0,
    `orderId` INTEGER NULL,
    `notes` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscriptions_orderId_key`(`orderId`),
    INDEX `subscriptions_userId_idx`(`userId`),
    INDEX `subscriptions_endsAt_idx`(`endsAt`),
    INDEX `subscriptions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_orders` ADD CONSTRAINT `payment_orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_orders` ADD CONSTRAINT `payment_orders_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `payment_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed the launch price list (₹119 / ₹299 / ₹529 / ₹799).
-- mrpInPaise is the 1-month rate x months, which drives the "you save" badge in the UI.
INSERT INTO `subscription_plans`
    (`code`, `name`, `nameHi`, `tagline`, `taglineHi`, `months`, `durationDays`, `priceInPaise`, `mrpInPaise`, `badge`, `badgeHi`, `highlight`, `isActive`, `sortOrder`, `updatedAt`)
VALUES
    ('STARTER_1M', 'Starter', 'स्टार्टर', 'Try the full app for a month', 'पूरा ऐप एक महीने चलाकर देखें', 1, 0, 11900, 11900, NULL, NULL, false, true, 1, CURRENT_TIMESTAMP(3)),
    ('BUILDER_3M', 'Builder', 'बिल्डर', 'For a full season of site work', 'एक पूरे सीज़न के काम के लिए', 3, 0, 29900, 35700, 'Save 16%', '16% बचत', false, true, 2, CURRENT_TIMESTAMP(3)),
    ('PRO_6M', 'Pro Thekedaar', 'प्रो ठेकेदार', 'Half a year, one payment', 'आधा साल, एक ही भुगतान', 6, 0, 52900, 71400, 'Most Popular', 'सबसे लोकप्रिय', true, true, 3, CURRENT_TIMESTAMP(3)),
    ('USTAAD_12M', 'Ustaad', 'उस्ताद', 'Best value — under ₹67 a month', 'सबसे किफ़ायती — ₹67/माह से कम', 12, 0, 79900, 142800, 'Best Value', 'सबसे बढ़िया', false, true, 4, CURRENT_TIMESTAMP(3));
