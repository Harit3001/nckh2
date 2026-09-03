/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "access_permissions" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "grantee_id" INTEGER NOT NULL,
    "grantee_type" VARCHAR(30) NOT NULL,
    "record_scope" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "tx_hash" VARCHAR(100),
    "status" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "access_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_requests" (
    "id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" INTEGER NOT NULL,
    "tx_hash" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "metadata" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "doctor_code" VARCHAR(100) NOT NULL,
    "speciality" VARCHAR(150) NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "wallet_address" VARCHAR(42),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexer_state" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "contract_address" VARCHAR(42) NOT NULL,
    "last_block" INTEGER NOT NULL,
    "last_synced_at" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "indexer_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "record_hash" VARCHAR(128) NOT NULL,
    "ipfs_cid" VARCHAR(255) NOT NULL,
    "tx_hash" VARCHAR(100),
    "block_number" INTEGER,
    "record_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reference_id" INTEGER,
    "reference_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "phid" VARCHAR(100) NOT NULL,
    "dob" DATE NOT NULL,
    "blood_type" VARCHAR(10),
    "allergy_info" TEXT,
    "national_id_hash" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "jti" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "wallet_address" VARCHAR(42),
    "hospital_id" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "access_permissions_tx_hash_key" ON "access_permissions"("tx_hash");

-- CreateIndex
CREATE INDEX "access_permissions_patient_id_idx" ON "access_permissions"("patient_id");

-- CreateIndex
CREATE INDEX "access_permissions_grantee_id_idx" ON "access_permissions"("grantee_id");

-- CreateIndex
CREATE INDEX "access_permissions_grantee_type_idx" ON "access_permissions"("grantee_type");

-- CreateIndex
CREATE INDEX "access_permissions_status_idx" ON "access_permissions"("status");

-- CreateIndex
CREATE INDEX "access_permissions_expires_at_idx" ON "access_permissions"("expires_at");

-- CreateIndex
CREATE INDEX "access_permissions_patient_id_status_idx" ON "access_permissions"("patient_id", "status");

-- CreateIndex
CREATE INDEX "access_permissions_grantee_id_status_idx" ON "access_permissions"("grantee_id", "status");

-- CreateIndex
CREATE INDEX "access_permissions_patient_id_grantee_id_idx" ON "access_permissions"("patient_id", "grantee_id");

-- CreateIndex
CREATE INDEX "access_requests_doctor_id_idx" ON "access_requests"("doctor_id");

-- CreateIndex
CREATE INDEX "access_requests_patient_id_idx" ON "access_requests"("patient_id");

-- CreateIndex
CREATE INDEX "access_requests_status_idx" ON "access_requests"("status");

-- CreateIndex
CREATE INDEX "access_requests_requested_at_idx" ON "access_requests"("requested_at");

-- CreateIndex
CREATE INDEX "access_requests_patient_id_status_idx" ON "access_requests"("patient_id", "status");

-- CreateIndex
CREATE INDEX "access_requests_doctor_id_status_idx" ON "access_requests"("doctor_id", "status");

-- CreateIndex
CREATE INDEX "access_requests_doctor_id_patient_id_idx" ON "access_requests"("doctor_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_tx_hash_key" ON "audit_logs"("tx_hash");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_idx" ON "audit_logs"("target_type");

-- CreateIndex
CREATE INDEX "audit_logs_target_id_idx" ON "audit_logs"("target_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_doctor_code_key" ON "doctors"("doctor_code");

-- CreateIndex
CREATE INDEX "doctors_hospital_id_idx" ON "doctors"("hospital_id");

-- CreateIndex
CREATE INDEX "doctors_hospital_id_speciality_idx" ON "doctors"("hospital_id", "speciality");

-- CreateIndex
CREATE INDEX "doctors_approved_at_idx" ON "doctors"("approved_at");

-- CreateIndex
CREATE INDEX "doctors_approved_by_idx" ON "doctors"("approved_by");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_code_key" ON "hospitals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_wallet_address_key" ON "hospitals"("wallet_address");

-- CreateIndex
CREATE INDEX "hospitals_name_idx" ON "hospitals"("name");

-- CreateIndex
CREATE INDEX "hospitals_is_active_idx" ON "hospitals"("is_active");

-- CreateIndex
CREATE INDEX "indexer_state_chain_id_idx" ON "indexer_state"("chain_id");

-- CreateIndex
CREATE INDEX "indexer_state_status_idx" ON "indexer_state"("status");

-- CreateIndex
CREATE INDEX "indexer_state_last_block_idx" ON "indexer_state"("last_block");

-- CreateIndex
CREATE INDEX "indexer_state_last_synced_at_idx" ON "indexer_state"("last_synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "indexer_state_chain_id_contract_address_key" ON "indexer_state"("chain_id", "contract_address");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_tx_hash_key" ON "medical_records"("tx_hash");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_idx" ON "medical_records"("doctor_id");

-- CreateIndex
CREATE INDEX "medical_records_hospital_id_idx" ON "medical_records"("hospital_id");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_created_at_idx" ON "medical_records"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_created_at_idx" ON "medical_records"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_records_hospital_id_created_at_idx" ON "medical_records"("hospital_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_records_record_type_idx" ON "medical_records"("record_type");

-- CreateIndex
CREATE INDEX "medical_records_block_number_idx" ON "medical_records"("block_number");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phid_key" ON "patients"("phid");

-- CreateIndex
CREATE UNIQUE INDEX "patients_national_id_hash_key" ON "patients"("national_id_hash");

-- CreateIndex
CREATE INDEX "patients_dob_idx" ON "patients"("dob");

-- CreateIndex
CREATE INDEX "patients_blood_type_idx" ON "patients"("blood_type");

-- CreateIndex
CREATE INDEX "patients_created_at_idx" ON "patients"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_jti_key" ON "refresh_tokens"("jti");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_expires_at_idx" ON "refresh_tokens"("userId", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "users_hospital_id_idx" ON "users"("hospital_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_hospital_id_role_idx" ON "users"("hospital_id", "role");

-- AddForeignKey
ALTER TABLE "access_permissions" ADD CONSTRAINT "access_permissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_requests" ADD CONSTRAINT "access_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
