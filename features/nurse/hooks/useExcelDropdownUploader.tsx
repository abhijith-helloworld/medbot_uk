"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Upload, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ExcelDropdownUploaderProps {
  uploadHook: () => { mutateAsync: (file: Blob) => Promise<any>; isLoading: boolean };
  downloadHook: () => { mutateAsync: () => Promise<any>; isLoading: boolean };
  buttonLabel?: string; // Optional, e.g. "Manage Patients Excel"
}

export default function ExcelDropdownUploader({
  uploadHook,
  downloadHook,
  buttonLabel = "Manage Excel",
}: ExcelDropdownUploaderProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // use hooks dynamically
  const { mutateAsync: uploadExcel, isLoading: uploading } = uploadHook();
  const { mutateAsync: downloadExcel, isLoading: downloading } = downloadHook();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });

      await uploadExcel(blob);
      toast({ title: "Success", description: "Excel uploaded successfully!" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to upload Excel file.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 p-4">
      <Input id="upload-excel" type="file" accept=".xlsx, .xls" onChange={handleUpload} className="hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {buttonLabel}
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => document.getElementById("upload-excel")?.click()}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload Excel"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => downloadExcel()}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Downloading..." : "Download Excel"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
