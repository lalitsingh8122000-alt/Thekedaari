-- Optional link: second row of same-day half-day split points to primary row id
ALTER TABLE `Attendance` ADD COLUMN `primarySplitId` INTEGER NULL;
CREATE INDEX `Attendance_primarySplitId_idx` ON `Attendance`(`primarySplitId`);
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_primarySplitId_fkey` FOREIGN KEY (`primarySplitId`) REFERENCES `Attendance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
