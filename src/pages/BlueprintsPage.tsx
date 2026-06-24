import { useEffect, useMemo, useState } from "react"
import { ClipboardList, Plus, Trash2, Save, Layers } from "lucide-react"
import {
  Card,
  CardHeader,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  EmptyState,
} from "@/components/ui"
import { useToast } from "@/components/Toaster"
import { useAsync } from "@/lib/useAsync"
import {
  getStockSnapshot,
  listFrameTypes,
  listMaterials,
  getFrameBlueprint,
  setFrameBlueprint,
} from "@/lib/api"

interface Line {
  materialId: string
  quantity: string
}

export function BlueprintsPage() {
  const { notify } = useToast()
  const frameTypes = useAsync(listFrameTypes, [])
  const materials = useAsync(listMaterials, [])
  const stockSnapshot = useAsync(getStockSnapshot, [])

  const [frameTypeId, setFrameTypeId] = useState("")
  const [lines, setLines] = useState<Line[]>([])
  const [loadingBp, setLoadingBp] = useState(false)
  const [saving, setSaving] = useState(false)

  // Default to the first frame type once loaded.
  useEffect(() => {
    if (frameTypes.data && frameTypes.data.length > 0 && !frameTypeId) {
      setFrameTypeId(frameTypes.data[0].id)
    }
  }, [frameTypes.data, frameTypeId])

  // Load the blueprint for the selected frame type.
  useEffect(() => {
    if (!frameTypeId) return
    let active = true
    setLoadingBp(true)
    getFrameBlueprint(frameTypeId)
      .then((bp) => {
        if (!active) return
        setLines(
          bp.materials.map((m) => ({
            materialId: m.materialId,
            quantity: String(m.quantity),
          })),
        )
      })
      .catch(() => {
        // 404 => no blueprint yet, start with one empty line.
        if (active) setLines([{ materialId: "", quantity: "" }])
      })
      .finally(() => {
        if (active) setLoadingBp(false)
      })
    return () => {
      active = false
    }
  }, [frameTypeId])

  const materialName = useMemo(() => {
    const map = new Map((materials.data ?? []).map((m) => [m.id, m]))
    return (id: string) => map.get(id)
  }, [materials.data])

  const stock = stockSnapshot.data ?? {}

  const usedIds = new Set(lines.map((l) => l.materialId).filter(Boolean))

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    )
  }

  function addLine() {
    setLines((prev) => [...prev, { materialId: "", quantity: "" }])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  async function save() {
    const parsed = lines
      .filter((l) => l.materialId && l.quantity)
      .map((l) => ({ materialId: l.materialId, quantity: Number(l.quantity) }))

    if (parsed.length === 0 || parsed.some((m) => m.quantity <= 0)) {
      notify(
        "Blueprint must contain at least one material with a quantity greater than zero.",
        "error",
      )
      return
    }
    setSaving(true)
    try {
      await setFrameBlueprint(frameTypeId, parsed)
      notify("Blueprint saved.")
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to save blueprint.", "error")
    } finally {
      setSaving(false)
    }
  }

  const selectedType = frameTypes.data?.find((t) => t.id === frameTypeId)
  const availableMaterials = materials.data ?? []

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Frame Blueprints</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the bill of materials consumed when assembling each frame type.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Select frame type"
          description="Each frame type maps to a single blueprint."
          icon={<Layers className="size-4" />}
        />
        <div className="px-5 py-4">
          <Select
            value={frameTypeId}
            onChange={(e) => setFrameTypeId(e.target.value)}
            className="max-w-sm"
          >
            {frameTypes.loading && <option>Loading...</option>}
            {(frameTypes.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.carType})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Bill of materials"
          description={
            selectedType
              ? `Materials required per ${selectedType.name}`
              : "Materials required per frame"
          }
          icon={<ClipboardList className="size-4" />}
          action={
            <Button variant="outline" size="sm" onClick={addLine}>
              <Plus className="size-3.5" />
              Add material
            </Button>
          }
        />

        {loadingBp ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-muted-foreground" />
          </div>
        ) : lines.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-6" />}
            title="No materials in this blueprint"
            description="Add at least one material to define the recipe."
          />
        ) : (
          <div className="flex flex-col gap-3 px-5 py-4">
            {lines.map((line, i) => {
              const mat = materialName(line.materialId)
              const onHand = line.materialId ? stock[line.materialId] ?? 0 : null
              return (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/20 p-3 sm:flex-row sm:items-end"
                >
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Material
                    </label>
                    <Select
                      value={line.materialId}
                      onChange={(e) =>
                        updateLine(i, { materialId: e.target.value })
                      }
                    >
                      <option value="" disabled>
                        Select material
                      </option>
                      {availableMaterials.map((m) => (
                        <option
                          key={m.id}
                          value={m.id}
                          disabled={usedIds.has(m.id) && m.id !== line.materialId}
                        >
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Quantity {mat ? `(${mat.unit})` : ""}
                    </label>
                    <Input
                      type="number"
                      min={1}
                      step="any"
                      value={line.quantity}
                      onChange={(e) => updateLine(i, { quantity: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    {onHand !== null && (
                      <Badge tone={onHand > 0 ? "neutral" : "danger"}>
                        {onHand} in stock
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(i)}
                      aria-label="Remove material"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end border-t border-border px-5 py-4">
          <Button onClick={save} disabled={saving || loadingBp}>
            {saving ? <Spinner /> : <Save className="size-4" />}
            Save blueprint
          </Button>
        </div>
      </Card>
    </div>
  )
}
