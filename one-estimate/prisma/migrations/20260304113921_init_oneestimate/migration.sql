/*
  Warnings:

  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Subscription";

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompanyInfo" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "tel" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "tel" TEXT,
    "email" TEXT,
    "address" TEXT,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Series" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseCost" INTEGER NOT NULL,
    "marginRate" DOUBLE PRECISION NOT NULL DEFAULT 0.22,
    "basePrice" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpecLabel" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeriesSpecValue" (
    "id" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "specLabelId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SeriesSpecValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptionCategory" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptionItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariationType" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VariationItem" (
    "id" TEXT NOT NULL,
    "variationTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TsuboCoefficient" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tsubo" INTEGER NOT NULL,
    "coefficient" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TsuboCoefficient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AtriumPrice" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AtriumPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomPriceSetting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "floor1BaseRooms" INTEGER NOT NULL DEFAULT 3,
    "floor1UnitCost" INTEGER NOT NULL DEFAULT 91000,
    "floor1UnitPrice" INTEGER NOT NULL DEFAULT 91000,
    "floor2UnitCost" INTEGER NOT NULL DEFAULT 66000,
    "floor2UnitPrice" INTEGER NOT NULL DEFAULT 66000,

    CONSTRAINT "RoomPriceSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "advice" TEXT,
    "inputType" TEXT NOT NULL DEFAULT 'CHOICE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Estimate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT NOT NULL,
    "estimateNumber" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "tsubo" INTEGER NOT NULL,
    "sectionA" INTEGER NOT NULL,
    "sectionATax" INTEGER NOT NULL,
    "sectionB" INTEGER NOT NULL,
    "sectionBTax" INTEGER NOT NULL,
    "sectionCVariation" INTEGER NOT NULL,
    "sectionCOption" INTEGER NOT NULL,
    "sectionCOther" INTEGER NOT NULL,
    "sectionC" INTEGER NOT NULL,
    "sectionCTax" INTEGER NOT NULL,
    "sectionD" INTEGER NOT NULL,
    "sectionDTax" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isEstimateIssued" BOOLEAN NOT NULL DEFAULT false,
    "isFundingIssued" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateVariation" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstimateVariation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateOption" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "EstimateOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateSectionB" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstimateSectionB_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateSectionC" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstimateSectionC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateSectionD" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EstimateSectionD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateAnswer" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceValue" TEXT NOT NULL,

    CONSTRAINT "EstimateAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EstimateAiResult" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "summary" TEXT,
    "tags" JSONB,
    "recommendations" JSONB NOT NULL,
    "totalAdditionalCost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateAiResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FundingPlan" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InitialSetting" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "defaultAmount" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InitialSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FundingPlanTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "defaultAmount" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundingPlanTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authUserId_key" ON "public"."User"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInfo_companyId_key" ON "public"."CompanyInfo"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesSpecValue_seriesId_specLabelId_key" ON "public"."SeriesSpecValue"("seriesId", "specLabelId");

-- CreateIndex
CREATE UNIQUE INDEX "VariationType_companyId_slug_key" ON "public"."VariationType"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "TsuboCoefficient_companyId_tsubo_key" ON "public"."TsuboCoefficient"("companyId", "tsubo");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPriceSetting_companyId_key" ON "public"."RoomPriceSetting"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_companyId_estimateNumber_key" ON "public"."Estimate"("companyId", "estimateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateAiResult_estimateId_key" ON "public"."EstimateAiResult"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "FundingPlan_estimateId_key" ON "public"."FundingPlan"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "InitialSetting_companyId_section_itemName_key" ON "public"."InitialSetting"("companyId", "section", "itemName");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompanyInfo" ADD CONSTRAINT "CompanyInfo_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Series" ADD CONSTRAINT "Series_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpecLabel" ADD CONSTRAINT "SpecLabel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeriesSpecValue" ADD CONSTRAINT "SeriesSpecValue_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SeriesSpecValue" ADD CONSTRAINT "SeriesSpecValue_specLabelId_fkey" FOREIGN KEY ("specLabelId") REFERENCES "public"."SpecLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionCategory" ADD CONSTRAINT "OptionCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionItem" ADD CONSTRAINT "OptionItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."OptionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariationType" ADD CONSTRAINT "VariationType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VariationItem" ADD CONSTRAINT "VariationItem_variationTypeId_fkey" FOREIGN KEY ("variationTypeId") REFERENCES "public"."VariationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TsuboCoefficient" ADD CONSTRAINT "TsuboCoefficient_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AtriumPrice" ADD CONSTRAINT "AtriumPrice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomPriceSetting" ADD CONSTRAINT "RoomPriceSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionChoice" ADD CONSTRAINT "QuestionChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estimate" ADD CONSTRAINT "Estimate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estimate" ADD CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estimate" ADD CONSTRAINT "Estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estimate" ADD CONSTRAINT "Estimate_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "public"."Series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateVariation" ADD CONSTRAINT "EstimateVariation_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateOption" ADD CONSTRAINT "EstimateOption_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateOption" ADD CONSTRAINT "EstimateOption_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."OptionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateOption" ADD CONSTRAINT "EstimateOption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."OptionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateSectionB" ADD CONSTRAINT "EstimateSectionB_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateSectionC" ADD CONSTRAINT "EstimateSectionC_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateSectionD" ADD CONSTRAINT "EstimateSectionD_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateAnswer" ADD CONSTRAINT "EstimateAnswer_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EstimateAiResult" ADD CONSTRAINT "EstimateAiResult_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FundingPlan" ADD CONSTRAINT "FundingPlan_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "public"."Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InitialSetting" ADD CONSTRAINT "InitialSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FundingPlanTemplate" ADD CONSTRAINT "FundingPlanTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
