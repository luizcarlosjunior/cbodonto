/*
  Warnings:

  - You are about to drop the column `address` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Patient` DROP COLUMN `address`,
    ADD COLUMN `bairro` VARCHAR(191) NULL,
    ADD COLUMN `cep` VARCHAR(191) NULL,
    ADD COLUMN `cidade` VARCHAR(191) NULL,
    ADD COLUMN `complemento` VARCHAR(191) NULL,
    ADD COLUMN `estado` VARCHAR(191) NULL,
    ADD COLUMN `logradouro` VARCHAR(191) NULL,
    ADD COLUMN `numero` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SiteSettings` MODIFY `whatsappNumber` VARCHAR(191) NOT NULL DEFAULT '5541997234253';

-- AlterTable
ALTER TABLE `Testimonial` ADD COLUMN `photoUrl` VARCHAR(191) NULL;
