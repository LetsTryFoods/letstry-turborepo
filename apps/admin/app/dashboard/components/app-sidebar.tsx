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
import {
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Bookmark,
  Briefcase,
  CreditCard,
  DollarSign,
  FileText,
  FolderTree,
  Image,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  Newspaper,
  Package,
  Package2,
  PackageCheck,
  PanelBottom,
  PenTool,
  ShoppingBag,
  Tag,
  Trash2,
  UserCheck,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
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

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// Sidebar reorganized into logical groups so the content team can find
// what they need without scrolling through 25 flat items. Order within
// each group is alphabetical-ish but with the most-used items first.
const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "SEO Onboarding", url: "/dashboard/seo-content/onboarding", icon: ListChecks },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", url: "/dashboard/products", icon: Package },
      { title: "Categories", url: "/dashboard/categories", icon: FolderTree },
      { title: "Banners", url: "/dashboard/banners", icon: Image },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Blogs", url: "/dashboard/blogs", icon: FileText },
      { title: "Blog Categories", url: "/dashboard/blog-categories", icon: Bookmark },
      { title: "Landing Pages", url: "/dashboard/landing-pages", icon: Layers },
      { title: "Category Pages", url: "/dashboard/category-landing-pages", icon: Layers },
      { title: "Pillars", url: "/dashboard/pillars", icon: BookOpen },
      { title: "Authors", url: "/dashboard/authors", icon: PenTool },
      { title: "Press Mentions", url: "/dashboard/press-mentions", icon: Newspaper },
      // FAQ admin page is hidden — its hook (apps/admin/lib/faq/useFAQ.ts) is
      // entirely dummy data with no backend. Re-add when the FAQ resolver
      // ships.
    ],
  },
  {
    label: "SEO",
    items: [
      // SEO Content (/dashboard/seo-content) is hidden — admin calls
      // seoContents/createSeoContent etc. but no backend resolvers exist.
      // Every load returns 400. Re-add when SeoContent module ships.
      //
      // Product SEO (/dashboard/sco-product) is hidden — admin hook
      // (apps/admin/lib/product-seo/useProductSeo.ts) is entirely mocked
      // (`return { data: { ... } }` on every save, no real mutate call).
      // Per-product SEO IS editable via the standard /dashboard/products
      // edit screen, which writes through updateProduct → ProductSeo
      // collection correctly.
      { title: "Category SEO", url: "/dashboard/sco-category", icon: FolderTree },
      { title: "Policy SEO", url: "/dashboard/sco-policy", icon: FileText },
      { title: "URL Redirects", url: "/dashboard/redirects", icon: ArrowRightLeft },
    ],
  },
  {
    label: "Commerce",
    items: [
      { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
      { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
      { title: "Shipments", url: "/dashboard/shipments", icon: Package2 },
      { title: "Coupons", url: "/dashboard/coupons", icon: Tag },
      { title: "Charges", url: "/dashboard/charges", icon: DollarSign },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Customers", url: "/dashboard/customers", icon: Users },
      // Reviews admin (/dashboard/reviews) is hidden — useReviews.ts is
      // entirely dummy data with a literal "TODO: Replace with actual
      // GraphQL queries when backend is ready" comment. No Review module
      // exists in the backend. Re-add when the Reviews backend ships
      // (Sprint 7+).
    ],
  },
  {
    label: "Inquiries",
    items: [
      { title: "Contact Queries", url: "/dashboard/contact", icon: MessageSquare },
      { title: "Corporate Enquiries", url: "/dashboard/corporate-enquiries", icon: Briefcase },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Packers", url: "/dashboard/packers", icon: UserCheck },
      { title: "Packing Orders", url: "/dashboard/packing-orders", icon: PackageCheck },
      // Notifications admin (/dashboard/notifications) is hidden —
      // useNotifications.ts is entirely dummy data, no Notification module
      // in the backend. Send-notification dialog is mock. Re-add when the
      // backend module ships.
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Footer Detail", url: "/dashboard/footer-detail", icon: PanelBottom },
      { title: "Pickup Locations", url: "/dashboard/pickup-locations", icon: Building2 },
      // App Settings (/dashboard/settings) and Profile (/dashboard/profile)
      // are hidden — both pages are local-state mocks. Password change
      // calls console.log only; no backend wired. Re-add when backend
      // ships.
    ],
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { data: policiesData } = usePolicies()
  const { mutate: deletePolicy } = useDeletePolicy()
  const policies = (policiesData as { policies?: Array<{ _id: string; title: string }> })?.policies || []

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<{ _id: string; title: string } | null>(null)

  const handleDeleteClick = (policy: { _id: string; title: string }) => {
    setPolicyToDelete(policy)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!policyToDelete) return

    try {
      await deletePolicy({
        variables: { id: policyToDelete._id },
      })
      toast.success("Policy deleted successfully")
      setDeleteDialogOpen(false)
      setPolicyToDelete(null)
      router.push("/dashboard")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete policy")
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}

        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center pr-2">
            Policies
            <a
              href="/dashboard/policies/create"
              className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
            >
              + Add
            </a>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {policies.map((policy) => (
                <SidebarMenuItem key={policy._id} className="group/item">
                  <SidebarMenuButton asChild>
                    <a
                      href={`/dashboard/policies/${policy.title}`}
                      className="flex justify-between items-center"
                    >
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
              This action cannot be undone. This will permanently delete the policy &quot;{policyToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  )
}
