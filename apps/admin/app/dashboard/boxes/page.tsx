"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useBoxPage } from "../../../hooks/useBoxPage";
import { BoxForm } from "./components/BoxForm";
import { BoxTable } from "./components/BoxTable";

export default function BoxesPage() {
  const { state, actions } = useBoxPage();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Box Management</h2>
        <div className="flex items-center space-x-2">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search boxes by code or name..."
              className="pl-8"
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog
            open={state.isDialogOpen}
            onOpenChange={actions.setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={actions.handleAddBox}>Add Box Size</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {state.editingBox ? "Edit Box Size" : "Add New Box Size"}
                </DialogTitle>
              </DialogHeader>
              <BoxForm
                onClose={actions.handleCloseDialog}
                initialData={state.editingBox}
                createBox={actions.createBox}
                updateBox={actions.updateBox}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <BoxTable
          boxes={state.boxes}
          loading={state.loading}
          onEdit={actions.handleEdit}
        />
      </div>
    </div>
  );
}
