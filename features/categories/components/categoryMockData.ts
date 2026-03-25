import type { CategoryResponse } from "../schema/categorySchema"

export const mockCategories: CategoryResponse[] = [
  {
    id: "1614f0f9-7ac5-4a67-9c37-0dc49cdf8ef4",
    name: "Travel",
    description: "Flights, hotels, and transportation",
    limitPerSubmission: 1500,
    active: true,
    createdAt: "2026-01-10T03:00:00.000Z",
  },
  {
    id: "7ddcdb9a-1b22-43ca-a3e3-b0f0fdbe0f5a",
    name: "Meals",
    description: "Client and business meals",
    limitPerSubmission: 200,
    active: true,
    createdAt: "2026-01-11T03:00:00.000Z",
  },
  {
    id: "23ced6f5-adcf-4ddd-92aa-3e257f9ce2b5",
    name: "Supplies",
    description: "Office and workstation supplies",
    limitPerSubmission: 300,
    active: true,
    createdAt: "2026-01-12T03:00:00.000Z",
  },
  {
    id: "df327104-9f56-414e-ad21-bb7e2fae57fd",
    name: "Training",
    description: "Courses, certifications, and workshops",
    limitPerSubmission: null,
    active: false,
    createdAt: "2026-01-13T03:00:00.000Z",
  },
]
