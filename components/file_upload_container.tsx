'use client'
import { Files } from "lucide-react"
import FileUpload from "./FileUpload"
import { useState } from "react"
import { FileWithPreview } from "@/types/file"
import { toast } from "sonner"

const FileUploadContainer = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const handleChange = (newFiles: FileWithPreview[]) => {
    setFiles(newFiles)
    if (newFiles.length > 0) {
      toast.success(`${newFiles.length} file(s) uploaded successfully!`)
    }
  }

  const handleRemove = (remainingFiles: FileWithPreview[]) => {
    setFiles(remainingFiles)
    toast.info("File removed")
  }

  return (
    <div className="w-full">
      <FileUpload 
        value={files}
        onChange={handleChange}
        onRemove={handleRemove}
        maxFiles={1}
        maxSize={20} // Fixed: maxSizes -> maxSize
        accept={{
          "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
          "application/pdf": [".pdf"] // Fixed: aplication -> application
        }}
      />
      
      {/* Optional: Display uploaded files info */}
      {files.length > 0 && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Uploaded Files:</h3>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                {file.file.name} ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUploadContainer