import { useMemo, useState } from "react"
import { Plus, Minus, Warehouse, Search } from "lucide-react"
import {
  Card,
  Button,
  Input,
  Badge,
  Modal,
  Field,
  Spinner,
  EmptyState,
} from "@/components/ui"
import { useToast } from "@/components/Toaster"
import { useAsync } from "@/lib/useAsync"
import { listMaterials, addMaterial, deductMaterial, getStockSnapshot } from "@/lib/api"
import type { MaterialCatalogItem } from "@/lib/types"

const LOW = 50

type Mode = "add" | "deduct"

export function InventoryPage() {
  const { notify } = useToast()
  const materials = useAsync(listMaterials, [])
  const stockSnapshot = useAsync(getStockSnapshot, [])
  const [query, setQuery] = useState("")

  const stock = stockSnapshot.data ?? {}

  const [action, setAction] = useState<{
    mode: Mode
    material: MaterialCatalogItem
  } | null>(null)

  const rows = (materials.data ?? [])
    .map((m) => ({ ...m, quantity: stock[m.id] ?? 0 }))
    .filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Material Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add incoming stock or deduct consumed materials. Deductions are
          rejected when stock is insufficient.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Badge tone="neutral">{rows.length}</Badge>
        </div>

        {materials.loading || stockSnapshot.loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Warehouse className="size-6" />}
            title="No materials found"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Material</th>
                  <th className="px-5 py-3 font-medium">Material ID</th>
                  <th className="px-5 py-3 font-medium">On hand</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-3 font-medium">{m.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {m.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      {m.quantity}{" "}
                      <span className="text-xs text-muted-foreground">
                        {m.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {m.quantity === 0 ? (
                        <Badge tone="danger">Out of stock</Badge>
                      ) : m.quantity <= LOW ? (
                        <Badge tone="warning">Low</Badge>
                      ) : (
                        <Badge tone="success">In stock</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAction({ mode: "add", material: m })}
                        >
                          <Plus className="size-3.5" />
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAction({ mode: "deduct", material: m })}
                          disabled={m.quantity === 0}
                        >
                          <Minus className="size-3.5" />
                          Deduct
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <StockModal
        action={action}
        currentQuantity={action ? stock[action.material.id] ?? 0 : 0}
        onClose={() => setAction(null)}
        onDone={(msg) => {
          setAction(null)
          stockSnapshot.reload()
          notify(msg)
        }}
        onError={(m) => notify(m, "error")}
      />
    </div>
  )
}

function StockModal({
  action,
  currentQuantity,
  onClose,
  onDone,
  onError,
}: {
  action: { mode: Mode; material: MaterialCatalogItem } | null
  currentQuantity: number
  onClose: () => void
  onDone: (msg: string) => void
  onError: (m: string) => void
}) {
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function close() {
    setAmount("")
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!action) return
    const qty = Number(amount)
    if (!qty || qty <= 0) {
      onError("Quantity must be greater than zero.")
      return
    }
    setSubmitting(true)
    try {
      if (action.mode === "add") {
        await addMaterial(action.material.id, qty)
        onDone(`Added ${qty} ${action.material.unit} of ${action.material.name}.`)
      } else {
        await deductMaterial(action.material.id, qty)
        onDone(
          `Deducted ${qty} ${action.material.unit} of ${action.material.name}.`,
        )
      }
      setAmount("")
    } catch (err) {
      onError(err instanceof Error ? err.message : "Operation failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const isAdd = action?.mode === "add"

  return (
    <Modal
      open={!!action}
      onClose={close}
      title={isAdd ? "Add stock" : "Deduct stock"}
      description={action?.material.name}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Current on hand</span>
          <span className="font-mono font-medium">
            {currentQuantity} {action?.material.unit}
          </span>
        </div>

        <Field
          label={isAdd ? "Quantity to add" : "Quantity to deduct"}
          htmlFor="amount"
          hint={
            !isAdd
              ? "Cannot exceed the quantity currently on hand."
              : undefined
          }
        >
          <Input
            id="amount"
            type="number"
            min={1}
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            required
          />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isAdd ? "primary" : "destructive"}
            disabled={submitting}
          >
            {submitting ? (
              <Spinner />
            ) : isAdd ? (
              <Plus className="size-4" />
            ) : (
              <Minus className="size-4" />
            )}
            {isAdd ? "Add stock" : "Deduct stock"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
