import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { approvalRequests } from "@/lib/mock-data"

export default function AprovacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Aprovações</h1>
        <p className="text-sm text-muted-foreground">
          Solicitações de colaboradores aguardando ou já revisadas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvalRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.employeeName}
                  </TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleDateString(
                      "pt-BR"
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pendente" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          Rejeitar
                        </Button>
                        <Button size="sm">Aprovar</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
