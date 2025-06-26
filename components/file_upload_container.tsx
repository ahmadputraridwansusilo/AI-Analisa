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
}

const handleRemove = (file: FileWithPreview) => {
  toast
}

  return (
    <div className="w-full">
      <FileUpload value={files}
      onChange={handleChange}
      onRemove={handleRemove}
      maxFiles={1}
      maxSizes={20}
      accept={{
        "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
        "aplication/pdf":[".pdf"]
      }}/>
    </div>
  )
}

export default FileUploadContainer