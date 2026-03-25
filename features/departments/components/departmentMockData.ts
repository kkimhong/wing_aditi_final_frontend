import type { DepartmentResponse } from "../schema/departmentSchema"

export const mockDepartments: DepartmentResponse[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Engineering",
    budgetLimit: 50000,
    userCount: 24,
    createdAt: "2026-01-05T03:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Finance",
    budgetLimit: 20000,
    userCount: 8,
    createdAt: "2026-01-06T03:00:00.000Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Operations",
    budgetLimit: 30000,
    userCount: 12,
    createdAt: "2026-01-07T03:00:00.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Human Resources",
    budgetLimit: 15000,
    userCount: 6,
    createdAt: "2026-01-08T03:00:00.000Z",
  },
]
