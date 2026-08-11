-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rh";

-- CreateEnum
CREATE TYPE "rh"."status_funcionario" AS ENUM ('ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO');

-- CreateEnum
CREATE TYPE "rh"."status_ferias" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "rh"."tipo_beneficio" AS ENUM ('SAUDE', 'ODONTOLOGICO', 'VALE_REFEICAO', 'VALE_TRANSPORTE', 'PREVIDENCIA_PRIVADA', 'SEGURO_DE_VIDA', 'GYMPASS', 'VALE_CULTURA');

-- CreateTable
CREATE TABLE "rh"."cargos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "salario_base" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rh"."beneficios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "rh"."tipo_beneficio" NOT NULL,
    "valor_padrao" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rh"."funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_admissao" TIMESTAMP(3) NOT NULL,
    "status" "rh"."status_funcionario" NOT NULL DEFAULT 'ATIVO',
    "cargo_id" TEXT NOT NULL,
    "salario_atual" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rh"."funcionario_beneficios" (
    "funcionario_id" TEXT NOT NULL,
    "beneficio_id" TEXT NOT NULL,
    "valor_customizado" DECIMAL(10,2),
    "data_adesao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionario_beneficios_pkey" PRIMARY KEY ("funcionario_id","beneficio_id")
);

-- CreateTable
CREATE TABLE "rh"."historico_salarios" (
    "id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "motivo" TEXT NOT NULL,
    "data_alteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_salarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rh"."ferias" (
    "id" TEXT NOT NULL,
    "funcionario_id" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "dias" INTEGER NOT NULL,
    "status" "rh"."status_ferias" NOT NULL DEFAULT 'AGENDADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ferias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_email_key" ON "rh"."funcionarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "rh"."funcionarios"("cpf");

-- CreateIndex
CREATE INDEX "funcionarios_cargo_id_idx" ON "rh"."funcionarios"("cargo_id");

-- CreateIndex
CREATE INDEX "funcionarios_status_idx" ON "rh"."funcionarios"("status");

-- CreateIndex
CREATE INDEX "funcionario_beneficios_beneficio_id_idx" ON "rh"."funcionario_beneficios"("beneficio_id");

-- CreateIndex
CREATE INDEX "historico_salarios_funcionario_id_idx" ON "rh"."historico_salarios"("funcionario_id");

-- CreateIndex
CREATE INDEX "ferias_funcionario_id_idx" ON "rh"."ferias"("funcionario_id");

-- AddForeignKey
ALTER TABLE "rh"."funcionarios" ADD CONSTRAINT "funcionarios_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "rh"."cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rh"."funcionario_beneficios" ADD CONSTRAINT "funcionario_beneficios_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "rh"."funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rh"."funcionario_beneficios" ADD CONSTRAINT "funcionario_beneficios_beneficio_id_fkey" FOREIGN KEY ("beneficio_id") REFERENCES "rh"."beneficios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rh"."historico_salarios" ADD CONSTRAINT "historico_salarios_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "rh"."funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rh"."ferias" ADD CONSTRAINT "ferias_funcionario_id_fkey" FOREIGN KEY ("funcionario_id") REFERENCES "rh"."funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

