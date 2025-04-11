-- DropForeignKey
ALTER TABLE "PurchaseOrderDetail" DROP CONSTRAINT "PurchaseOrderDetail_productIdentityId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrderDetail" ALTER COLUMN "productIdentityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PurchaseOrderDetail" ADD CONSTRAINT "PurchaseOrderDetail_productIdentityId_fkey" FOREIGN KEY ("productIdentityId") REFERENCES "ProductIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
