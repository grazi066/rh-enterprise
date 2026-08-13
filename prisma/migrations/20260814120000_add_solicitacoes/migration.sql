-- CreateEnum
CREATE TYPE "rh"."tipo_solicitacao" AS ENUM ('FERIAS', 'REEMBOLSO', 'HOME_OFFICE', 'ADVERTENCIA');

-- CreateEnum
CREATE TYPE "rh"."status_solicitacao" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO');

-- CreateTable
CREATE TABLE "rh"."solicitacoes" (
    "id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "tipo" "rh"."tipo_solicitacao" NOT NULL,
    "status" "rh"."status_solicitacao" NOT NULL DEFAULT 'PENDENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitacoes_funcionario_id_idx" ON "rh"."solicitacoes"("funcionario_id");

-- CreateIndex
CREATE INDEX "solicitacoes_status_idx" ON "rh"."solicitacoes"("status");

-- AddForeignKey
ALTER TABLE "rh"."solicitacoes" ADD CONSTRAINT "solicitacoes_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "rh"."funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
