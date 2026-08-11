-- CreateEnum
CREATE TYPE "rh"."status_folha" AS ENUM ('PENDENTE', 'PROCESSANDO', 'PAGO');

-- CreateEnum
CREATE TYPE "rh"."status_item_folha" AS ENUM ('PENDENTE', 'PAGO');

-- CreateTable
CREATE TABLE "rh"."folhas_pagamento" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" "rh"."status_folha" NOT NULL DEFAULT 'PENDENTE',
    "valor_total" DECIMAL(12,2) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "folhas_pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rh"."itens_folha" (
    "id" TEXT NOT NULL,
    "folha_id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "salario_bruto" DECIMAL(10,2) NOT NULL,
    "descontos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valor_liquido" DECIMAL(10,2) NOT NULL,
    "status" "rh"."status_item_folha" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "itens_folha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "folhas_pagamento_mes_ano_key" ON "rh"."folhas_pagamento"("mes", "ano");

-- CreateIndex
CREATE INDEX "itens_folha_funcionario_id_idx" ON "rh"."itens_folha"("funcionario_id");

-- CreateIndex
CREATE UNIQUE INDEX "itens_folha_folha_id_funcionario_id_key" ON "rh"."itens_folha"("folha_id", "funcionario_id");

-- AddForeignKey
ALTER TABLE "rh"."itens_folha" ADD CONSTRAINT "itens_folha_folha_id_fkey" FOREIGN KEY ("folha_id") REFERENCES "rh"."folhas_pagamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rh"."itens_folha" ADD CONSTRAINT "itens_folha_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "rh"."funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

