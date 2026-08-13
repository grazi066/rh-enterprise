-- CreateEnum
CREATE TYPE "rh"."role" AS ENUM ('ADMIN', 'GESTOR', 'COLABORADOR');

-- AlterTable
ALTER TABLE "rh"."funcionarios" ADD COLUMN     "role" "rh"."role" NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "rh"."audit_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "usuario_nome" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT,
    "detalhes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_acao_idx" ON "rh"."audit_logs"("acao");

-- CreateIndex
CREATE INDEX "audit_logs_entidade_idx" ON "rh"."audit_logs"("entidade");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "rh"."audit_logs"("created_at");

