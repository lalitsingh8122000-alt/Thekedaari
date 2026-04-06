-- Link ledger rows created from project finance expenses so edits/deletes stay in sync with contractor balances.
ALTER TABLE `LedgerEntry` ADD COLUMN `expenseId` INTEGER NULL;

CREATE UNIQUE INDEX `LedgerEntry_expenseId_key` ON `LedgerEntry`(`expenseId`);

ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `Expense`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
