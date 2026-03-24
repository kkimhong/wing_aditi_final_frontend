"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RegisterUserForm } from "@/features/users/components/RegisterUserForm"
import { UserTable } from "@/features/users/components/UserTable"
import type { UserResponse, RegisterRequest } from "@/features/users/types/userTypes"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Plus } from "lucide-react"

// Mock data — replace with API calls
const mockUsers: UserResponse[] = []

export default function UsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleRegister = (data: RegisterRequest) => {
    console.log("Register user:", data)
    setDrawerOpen(false)
  }

  return (
    <DashboardLayout
      title="Users"
      actions={
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          direction="right"
        >
          <DrawerTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Register User
            </Button>
          </DrawerTrigger>
          <DrawerContent className="fixed inset-y-0 right-0 w-[40vw] max-w-none rounded-l-lg">
            <DrawerHeader>
              <DrawerTitle>Register User</DrawerTitle>
              <DrawerDescription>Create a new user account.</DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <RegisterUserForm onSubmit={handleRegister} />
            </div>
            <DrawerFooter className="pt-0">
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <UserTable users={mockUsers} />
    </DashboardLayout>
  )
}
