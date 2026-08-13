-- RenameEnumValue (tabela solicitacoes ainda não tinha linhas em produção)
ALTER TYPE "rh"."tipo_solicitacao" RENAME VALUE 'HOME_OFFICE' TO 'AJUSTE_SALARIAL';
ALTER TYPE "rh"."tipo_solicitacao" RENAME VALUE 'ADVERTENCIA' TO 'ALTERACAO_CARGO';

-- AlterTable
ALTER TABLE "rh"."solicitacoes" ADD COLUMN "justificativa" TEXT;
