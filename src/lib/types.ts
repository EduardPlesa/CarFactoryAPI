// Mirrors CarFactory.Contracts (the .NET API DTOs)

export interface FrameResponse {
  id: string
  carType: string
  name: string
  slug: string
}

export interface CreateFrameRequest {
  frameTypeId: string
  carType: string
  name: string
}

export interface UpdateFrameRequest {
  carType: string
  name: string
}

export interface MaterialStockResponse {
  materialId: string
  quantity: number
}

export interface BlueprintMaterialResponse {
  materialId: string
  quantity: number
}

export interface FrameBlueprintResponse {
  frameTypeId: string
  materials: BlueprintMaterialResponse[]
}

// Local-only catalog metadata. The API identifies materials and frame types
// purely by GUID, so the UI keeps friendly labels alongside those ids.
export interface MaterialCatalogItem {
  id: string
  name: string
  unit: string
}

export interface FrameTypeCatalogItem {
  id: string
  name: string
  carType: string
}
