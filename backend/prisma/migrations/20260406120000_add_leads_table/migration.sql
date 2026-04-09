-- Leads table for ERP monitor dashboard (replaces manual SQL so deploys keep schema)

CREATE TABLE `leads` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `company_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `address` TEXT NULL,
    `source` VARCHAR(100) NULL,
    `status` ENUM('new_lead', 'call_pending', 'call_in_progress', 'call_not_answered', 'call_back', 'interested', 'demo_scheduled', 'demo_done', 'demo_pending', 'not_interested', 'wrong_number', 'converted', 'lost') NOT NULL DEFAULT 'new_lead',
    `lead_stage` ENUM('cold', 'warm', 'hot') NOT NULL DEFAULT 'cold',
    `assigned_to` BIGINT UNSIGNED NULL,
    `remarks` TEXT NULL,
    `last_call_at` DATETIME(3) NULL,
    `next_followup_at` DATETIME(3) NULL,
    `converted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `idx_phone` ON `leads`(`phone`);
CREATE INDEX `idx_status` ON `leads`(`status`);
CREATE INDEX `idx_assigned_to` ON `leads`(`assigned_to`);
CREATE INDEX `idx_company` ON `leads`(`company_id`);
CREATE INDEX `idx_leads_created_at` ON `leads`(`created_at`);
CREATE INDEX `idx_leads_next_followup_at` ON `leads`(`next_followup_at`);
CREATE INDEX `idx_leads_lead_stage` ON `leads`(`lead_stage`);
CREATE INDEX `idx_leads_source` ON `leads`(`source`);
CREATE INDEX `idx_leads_assigned_status` ON `leads`(`assigned_to`, `status`);
