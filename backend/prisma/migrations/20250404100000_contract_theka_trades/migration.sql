-- Contract / theka trade types (per user). Existing workers get workerType = Labour via default.
CREATE TABLE `ContractTrade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `ContractTrade_userId_idx` ON `ContractTrade`(`userId`);

ALTER TABLE `ContractTrade` ADD CONSTRAINT `ContractTrade_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Worker` ADD COLUMN `workerType` VARCHAR(20) NOT NULL DEFAULT 'Labour';
ALTER TABLE `Worker` ADD COLUMN `contractTradeId` INTEGER NULL;

CREATE INDEX `Worker_contractTradeId_idx` ON `Worker`(`contractTradeId`);

ALTER TABLE `Worker` ADD CONSTRAINT `Worker_contractTradeId_fkey` FOREIGN KEY (`contractTradeId`) REFERENCES `ContractTrade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Expense` ADD COLUMN `contractTradeId` INTEGER NULL;

CREATE INDEX `Expense_contractTradeId_idx` ON `Expense`(`contractTradeId`);

ALTER TABLE `Expense` ADD CONSTRAINT `Expense_contractTradeId_fkey` FOREIGN KEY (`contractTradeId`) REFERENCES `ContractTrade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
