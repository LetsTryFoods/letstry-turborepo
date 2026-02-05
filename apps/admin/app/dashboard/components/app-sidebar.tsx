"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogOut, Image, FolderTree, Tag, DollarSign, ShoppingBag, ShoppingCart, Users, Star, Bell, BarChart3, HelpCircle, MessageSquare, UserCheck, PackageCheck, CreditCard, Package2, ArrowRightLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Package, Settings, LayoutDashboard, Truck, RefreshCcw, FileText, Trash2, Search, } from "lucide-react"
import { usePolicies, useDeletePolicy } from "@/lib/policies/usePolicies"
import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { handleLogout } from "@/lib/auth/logout"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Banners",
    url: "/dashboard/banners",
    icon: Image,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: FolderTree,
  },
  {
    title: "Blogs",
    url: "/dashboard/blogs",
    icon: FileText,
  },
  // {
  //   title: "Address",
  //   url: "/dashboard/address",
  //   icon: Truck,
  // },
  {
    title: "SEO Content",
    url: "/dashboard/seo-content",
    icon: RefreshCcw,
  },
  {
    title: "Product SEO",
    url: "/dashboard/sco-product",
    icon: Search,
  },
  {
    title: "Category SEO",
    url: "/dashboard/sco-category",
    icon: FolderTree,
  },
  {
    title: "Policy SEO",
    url: "/dashboard/sco-policy",
    icon: FileText,
  },
  {
    title: "Coupons",
    url: "/dashboard/coupons",
    icon: Tag,
  },
  {
    title: "Charges",
    url: "/dashboard/charges",
    icon: DollarSign,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
  },
  // {
  //   title: "Abandoned Carts",
  //   url: "/dashboard/cards",
  //   icon: ShoppingCart,
  // },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    title: "Shipments",
    url: "/dashboard/shipments",
    icon: Package2,
  },
  {
    title: "Contact Queries",
    url: "/dashboard/contact",
    icon: MessageSquare,
  },
  {
    title: "Packers",
    url: "/dashboard/packers",
    icon: UserCheck,
  },
  {
    title: "Packing Orders",
    url: "/dashboard/packing-orders",
    icon: PackageCheck,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "URL Redirects",
    url: "/dashboard/redirects",
    icon: ArrowRightLeft,
  }
]

export function AppSidebar() {
  const router = useRouter()
  const { data: policiesData } = usePolicies()
  const { mutate: deletePolicy } = useDeletePolicy()
  const policies = (policiesData as any)?.policies || []


  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<any>(null)

  const handleDeleteClick = (policy: any) => {
    setPolicyToDelete(policy)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!policyToDelete) return

    try {
      await deletePolicy({
        variables: { id: policyToDelete.id }
      })
      toast.success('Policy deleted successfully')
      setDeleteDialogOpen(false)
      setPolicyToDelete(null)
      router.push('/dashboard')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete policy')
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center pr-2">
            Policies
            <a href="/dashboard/policies/create" className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90">
              + Add
            </a>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {policies.map((policy: any) => (
                <SidebarMenuItem key={policy.id} className="group/item">
                  <SidebarMenuButton asChild>
                    <a href={`/dashboard/policies/${policy.title}`} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{policy.title}</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteClick(policy)
                    }}
                    className="absolute right-2 top-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the policy "{policyToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}