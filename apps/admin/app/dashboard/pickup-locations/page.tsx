"use client"

import { useState } from "react"
import { usePickupLocations, useCreatePickupLocation, useRemovePickupLocation } from "@/lib/shipments/pickup-location-queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, Building2 } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function PickupLocationsPage() {
  const { pickupLocations, loading, refetch } = usePickupLocations()
  const { createPickupLocation, loading: creating } = useCreatePickupLocation()
  const { removePickupLocation, loading: removing } = useRemovePickupLocation()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error("Location Nickname is required")
      return
    }

    try {
      await createPickupLocation({
        name: formData.name,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        provider: "SHIPROCKET",
        country: "India",
      })
      toast.success("Pickup location added successfully")
      setIsDialogOpen(false)
      setFormData({ name: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" })
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to add pickup location")
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pickup location?")) return

    try {
      await removePickupLocation(id)
      toast.success("Pickup location removed")
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to remove pickup location")
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pickup Locations</h1>
          <p className="text-muted-foreground">
            Manage your Shiprocket pickup addresses to streamline order dispatch.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Pickup Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Pickup Location</DialogTitle>
                <DialogDescription>
                  Enter the nickname of the pickup location exactly as it is saved in your Shiprocket dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nickname *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Delhi_Warehouse"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="city" className="text-right">
                    City
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="state" className="text-right">
                    State
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pincode" className="text-right">
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating ? "Saving..." : "Save Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Locations</CardTitle>
          <CardDescription>A list of all pickup locations available for order dispatch.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : pickupLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No pickup locations found.</p>
              <p className="text-sm text-muted-foreground">Add a new location to use it for Shiprocket dispatch.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nickname</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupLocations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.city || "-"}</TableCell>
                    <TableCell>{location.state || "-"}</TableCell>
                    <TableCell>{location.pincode || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(location._id)}
                        disabled={removing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
