import { useEffect, useState } from "react"
import { Boxes, Plus, Pencil, Trash2, Hammer, Search } from "lucide-react"
import {
  Card,
  Button,
  Input,
  Select,
  Field,
  Badge,
  Modal,
  Spinner,
  EmptyState,
} from "@/components/ui"
import { useToast } from "@/components/Toaster"
import { useAsync } from "@/lib/useAsync"
import {
  getFrames,
  listFrameTypes,
  createFrame,
  updateFrame,
  deleteFrame,
} from "@/lib/api"
import type { FrameResponse, FrameTypeCatalogItem } from "@/lib/types"

export function FramesPage() {
  const { notify } = useToast()
  const frames = useAsync(getFrames, [])
  const frameTypes = useAsync(listFrameTypes, [])
  const [query, setQuery] = useState("")

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<FrameResponse | null>(null)
  const [deleting, setDeleting] = useState<FrameResponse | null>(null)

  const filtered = (frames.data ?? []).filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.carType.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Frames</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assemble, edit, and retire car frames. New builds consume materials
            from inventory based on the frame type blueprint.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Assemble frame
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or car type..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Badge tone="neutral">{filtered.length}</Badge>
        </div>

        {frames.loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Boxes className="size-6" />}
            title={query ? "No matching frames" : "No frames yet"}
            description={
              query
                ? "Try a different search term."
                : "Assemble your first frame to get started."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Car type</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((f) => (
                  <tr key={f.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-3 font-medium">{f.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone="accent">{f.carType}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {f.slug}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {f.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${f.name}`}
                          onClick={() => setEditing(f)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${f.name}`}
                          onClick={() => setDeleting(f)}
                        >
                          <Trash2 className="size-4 text-destructive" />
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

      <CreateFrameModal
        open={createOpen}
        frameTypes={frameTypes.data ?? []}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false)
          frames.reload()
          notify("Frame assembled and materials consumed.")
        }}
        onError={(m) => notify(m, "error")}
      />

      <EditFrameModal
        frame={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          frames.reload()
          notify("Frame updated.")
        }}
        onError={(m) => notify(m, "error")}
      />

      <DeleteFrameModal
        frame={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null)
          frames.reload()
          notify("Frame removed.")
        }}
        onError={(m) => notify(m, "error")}
      />
    </div>
  )
}

// ---- Create ---------------------------------------------------------------

function CreateFrameModal({
  open,
  frameTypes,
  onClose,
  onCreated,
  onError,
}: {
  open: boolean
  frameTypes: FrameTypeCatalogItem[]
  onClose: () => void
  onCreated: () => void
  onError: (m: string) => void
}) {
  const [name, setName] = useState("")
  const [frameTypeId, setFrameTypeId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedType = frameTypes.find((t) => t.id === frameTypeId)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !frameTypeId) return
    setSubmitting(true)
    try {
      await createFrame({
        frameTypeId,
        name: name.trim(),
        carType: selectedType?.carType ?? "Unknown",
      })
      setName("")
      setFrameTypeId("")
      onCreated()
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to assemble frame.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assemble frame"
      description="Creating a frame deducts the blueprint materials from inventory."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Frame type" htmlFor="frameType">
          <Select
            id="frameType"
            value={frameTypeId}
            onChange={(e) => setFrameTypeId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a frame type
            </option>
            {frameTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.carType})
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Frame name" htmlFor="frameName">
          <Input
            id="frameName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sedan Build #1043"
            required
          />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !name || !frameTypeId}>
            {submitting ? <Spinner /> : <Hammer className="size-4" />}
            Assemble
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---- Edit -----------------------------------------------------------------

function EditFrameModal({
  frame,
  onClose,
  onSaved,
  onError,
}: {
  frame: FrameResponse | null
  onClose: () => void
  onSaved: () => void
  onError: (m: string) => void
}) {
  const [name, setName] = useState("")
  const [carType, setCarType] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Sync local form state whenever a different frame is selected.
  useEffect(() => {
    if (frame) {
      setName(frame.name)
      setCarType(frame.carType)
    }
  }, [frame])

  function close() {
    setName("")
    setCarType("")
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!frame) return
    setSubmitting(true)
    try {
      await updateFrame(frame.id, { name: name.trim(), carType: carType.trim() })
      setName("")
      setCarType("")
      onSaved()
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to update frame.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!frame}
      onClose={close}
      title="Edit frame"
      description="Update the frame name or car type."
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Frame name" htmlFor="editName">
          <Input
            id="editName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Car type" htmlFor="editType">
          <Input
            id="editType"
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            required
          />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !name || !carType}>
            {submitting ? <Spinner /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ---- Delete ---------------------------------------------------------------

function DeleteFrameModal({
  frame,
  onClose,
  onDeleted,
  onError,
}: {
  frame: FrameResponse | null
  onClose: () => void
  onDeleted: () => void
  onError: (m: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function confirm() {
    if (!frame) return
    setSubmitting(true)
    try {
      await deleteFrame(frame.id)
      onDeleted()
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to delete frame.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={!!frame}
      onClose={onClose}
      title="Delete frame"
      description="This action cannot be undone."
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium text-foreground">{frame?.name}</span>?
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={confirm} disabled={submitting}>
          {submitting ? <Spinner /> : <Trash2 className="size-4" />}
          Delete
        </Button>
      </div>
    </Modal>
  )
}
