"use client"

import { useState } from "react"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Map, Trash2, Loader2, AlertCircle, CheckCircle, Power, FileText } from "lucide-react"
import { useMaps, useActivateMap, useDeleteMap } from "@/features/admin/hooks/useMap"
import { MapData } from "@/features/admin/api/map"

export function MapManagement() {
  const { maps, isLoading, isError, error } = useMaps()
  const { mutate: activateMap, isPending: isActivating } = useActivateMap()
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteMap()

  const [activatingMapId, setActivatingMapId] = useState<number | null>(null)
  const [mapToDelete, setMapToDelete] = useState<MapData | null>(null)

  const handleSetActiveMap = (id: number) => {
    setActivatingMapId(id)
    activateMap(id, {
      onSettled: () => {
        setActivatingMapId(null)
      },
    })
  }

  const handleConfirmDelete = () => {
    if (mapToDelete) {
      deleteMap(mapToDelete.id, {
        onSuccess: () => {
          setMapToDelete(null)
        },
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading Maps...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="mt-2 font-semibold text-red-700">Failed to Load Maps</p>
        <p className="text-sm text-red-600">{error?.message || "An unknown error occurred."}</p>
      </div>
    )
  }

  const activeMap = maps.find((map) => map.is_active)
  const inactiveMaps = maps.filter((map) => !map.is_active)

  return (
    <>
      <div className="mx-auto space-y-6 px-4 md:px-6 lg:px-10 py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Map Management</h1>
          <p className="text-muted-foreground">Activate or delete robot navigation maps from the available list.</p>
        </div>

        {/* --- Active Map Section (Redesigned) --- */}
        {activeMap && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight border-b pb-4 mb-6">Active Map</h2>
            {/* UI REWORK: Banner-style card for active map, no image */}
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Map className="w-8 h-8 text-green-700" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{activeMap.map_name}</h3>
                  <p className="text-sm text-green-800">
                    Created: {new Date(activeMap.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Active
              </Badge>
            </div>
          </div>
        )}

        {/* --- Available Maps Section (Redesigned) --- */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight border-b pb-4 mb-6">Available Maps ({inactiveMaps.length})</h2>
          {inactiveMaps.length > 0 ? (
            // UI REWORK: Changed from grid to a vertical list layout
            <div className="space-y-4">
              {inactiveMaps.map((map) => (
                // UI REWORK: Each map is now a list item card
                <Card key={map.id} className="p-4 flex items-center justify-between transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">{map.map_name}</CardTitle>
                      <CardDescription>
                        Created: {new Date(map.created_at).toLocaleDateString()}
                        <span className="mx-2 text-slate-300">|</span>
                        {/* File: {map.robot_map_file.split("/").pop()} */}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetActiveMap(map.id)}
                      disabled={isActivating}
                    >
                      {isActivating && activatingMapId === map.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Power className="w-4 h-4 mr-2" />
                      )}
                      Set Active
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMapToDelete(map)}
                      disabled={isActivating}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-center py-16 border-2 border-dashed rounded-lg">
              <Map className="w-16 h-16 text-slate-400" />
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-700">No Other Maps Available</h3>
                <p className="text-muted-foreground">When new maps are added, they will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Delete Confirmation Dialog (Unchanged) --- */}
      <Dialog open={!!mapToDelete} onOpenChange={(isOpen) => !isOpen && setMapToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the map: <span className="font-semibold">{mapToDelete?.map_name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}