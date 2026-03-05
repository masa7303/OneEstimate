export type EstimateVariationItem = {
  id: string
  itemType: string
  itemName: string
  cost: number
  price: number
}

export type EstimateOptionItem = {
  id: string
  categoryId: string
  itemId: string
  cost: number
  price: number
  category: { name: string }
  item: { name: string }
}

export type EstimateSectionItem = {
  id: string
  itemName: string
  amount: number
  sortOrder: number
}

export type EstimateDetail = {
  id: string
  companyId: string
  customerId: string | null
  userId: string
  estimateNumber: string
  seriesId: string
  tsubo: number

  sectionA: number
  sectionATax: number
  sectionB: number
  sectionBTax: number
  sectionCVariation: number
  sectionCOption: number
  sectionCOther: number
  sectionC: number
  sectionCTax: number
  sectionD: number
  sectionDTax: number
  totalAmount: number

  status: string
  isEstimateIssued: boolean
  createdAt: string
  updatedAt: string

  series: { name: string; basePrice: number }
  customer: { id: string; name: string } | null
  user: { name: string | null; email: string }
  companyInfo: {
    name: string | null
    address: string | null
    tel: string | null
    fax: string | null
    notes: string | null
  } | null

  variations: EstimateVariationItem[]
  options: EstimateOptionItem[]
  sectionBItems: EstimateSectionItem[]
  sectionCItems: EstimateSectionItem[]
  sectionDItems: EstimateSectionItem[]
}
