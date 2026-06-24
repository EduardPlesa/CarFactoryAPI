import type {
  CreateFrameRequest,
  FrameBlueprintResponse,
  FrameResponse,
  FrameTypeCatalogItem,
  MaterialCatalogItem,
  MaterialStockResponse,
  UpdateFrameRequest,
} from "./types"

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5019")
  .replace(/\/$/, "")

const materials: MaterialCatalogItem[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Steel Sheet",
    unit: "kg",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Aluminum Beam",
    unit: "pcs",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Welding Wire",
    unit: "m",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Bolt Kit",
    unit: "set",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Carbon Panel",
    unit: "pcs",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Rubber Mount",
    unit: "pcs",
  },
]

const frameTypes: FrameTypeCatalogItem[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "Sedan Platform A1",
    carType: "Sedan",
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    name: "SUV Chassis X3",
    carType: "SUV",
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    name: "Roadster Spaceframe R",
    carType: "Roadster",
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    name: "Pickup Ladder T2",
    carType: "Pickup",
  },
]

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function readError(response: Response): Promise<string> {
  const text = await response.text()
  if (!text) return response.statusText || "Request failed."

  try {
    const body = JSON.parse(text)
    if (typeof body === "string") return body
    if (typeof body?.errorMessage === "string") {
      const missing = Array.isArray(body.missingMaterialIds)
        ? ` Missing material IDs: ${body.missingMaterialIds.join(", ")}.`
        : ""
      return `${body.errorMessage}${missing}`
    }
    if (typeof body?.title === "string") return body.title
  } catch {
    return text
  }

  return text
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(await readError(response), response.status)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  return text ? (JSON.parse(text) as T) : (undefined as T)
}

function json(method: "POST" | "PUT", body: unknown): RequestInit {
  return {
    method,
    body: JSON.stringify(body),
  }
}

export function listMaterials(): Promise<MaterialCatalogItem[]> {
  return Promise.resolve(materials)
}

export function listFrameTypes(): Promise<FrameTypeCatalogItem[]> {
  return Promise.resolve(frameTypes)
}

export async function getFrames(): Promise<FrameResponse[]> {
  const response = await request<{ items: FrameResponse[] }>("/api/frames")
  return response.items
}

export function createFrame(req: CreateFrameRequest): Promise<FrameResponse> {
  return request<FrameResponse>("/api/frames", json("POST", req))
}

export function updateFrame(
  id: string,
  req: UpdateFrameRequest,
): Promise<FrameResponse> {
  return request<FrameResponse>(`/api/frames/${id}`, json("PUT", req))
}

export function deleteFrame(id: string): Promise<void> {
  return request<void>(`/api/frames/${id}`, { method: "DELETE" })
}

export function getMaterialStock(
  materialId: string,
): Promise<MaterialStockResponse> {
  return request<MaterialStockResponse>(`/api/inventory/${materialId}`)
}

export async function getStockSnapshot(): Promise<Record<string, number>> {
  const entries = await Promise.all(
    materials.map(async (material) => {
      try {
        const stock = await getMaterialStock(material.id)
        return [material.id, stock.quantity] as const
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return [material.id, 0] as const
        }
        throw err
      }
    }),
  )

  return Object.fromEntries(entries)
}

export function addMaterial(
  materialId: string,
  quantity: number,
): Promise<MaterialStockResponse> {
  return request<MaterialStockResponse>(
    `/api/inventory/${materialId}/add`,
    json("POST", { quantity }),
  )
}

export function deductMaterial(
  materialId: string,
  quantity: number,
): Promise<MaterialStockResponse> {
  return request<MaterialStockResponse>(
    `/api/inventory/${materialId}/deduct`,
    json("POST", { quantity }),
  )
}

export function getFrameBlueprint(
  frameTypeId: string,
): Promise<FrameBlueprintResponse> {
  return request<FrameBlueprintResponse>(`/api/blueprints/frames/${frameTypeId}`)
}

export function setFrameBlueprint(
  frameTypeId: string,
  materials: { materialId: string; quantity: number }[],
): Promise<FrameBlueprintResponse> {
  return request<FrameBlueprintResponse>(
    `/api/blueprints/frames/${frameTypeId}`,
    json("PUT", { materials }),
  )
}
