-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `addressLine1` VARCHAR(191) NULL,
    ADD COLUMN `addressLine2` VARCHAR(191) NULL,
    ADD COLUMN `cnpj` VARCHAR(191) NULL,
    ADD COLUMN `customerServiceEmail` VARCHAR(191) NULL,
    ADD COLUMN `footerText` TEXT NULL,
    ADD COLUMN `legalName` VARCHAR(191) NULL,
    ADD COLUMN `tradeName` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL;
