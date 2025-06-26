import { FileWithPreview } from '@/types/file'
import React, { useCallback, useState } from 'react'
import { useDropzone } from "react-dropzone"
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { resolve } from 'path';
import { Upload } from 'lucide-react';


interface FileUploadProps {
    value?: FileWithPreview[];
    onRemove?: (file: FileWithPreview[]) => void;
    onChange?: (file: FileWithPreview[]) => void;
        maxFiles?: number;
        maxSize?: number;
        accept?: {[key: string] : string[]};
        disabled?: boolean;
        className?: string;
}

const FileUpload = ({
    value= [],
    onChange,
    onRemove,
    maxFiles = 1,
    maxSize = 20,
    accept = {
        "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
        "aplication/pdf":[".pdf"]
    },
    disabled = false,
    className,

}: FileUploadProps) => {

    const [files, setFiles] = useState<FileWithPreview[]>(value);


    const createdFilePreview = (file : File): Promise<string | null> => {
        return new Promise((resolve) => {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result as string)
                };
                reader.readAsDataURL(file)
            } else {
                resolve(null)
            }
        });
    };


    const simulateUpload = (fileWithPreview: FileWithPreview) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            setFiles((prevFiles) => 
            prevFiles.map((f) => 
            f.file === fileWithPreview.file
            ? {...f, progress: Math.min(progress, 100) }
            : f
            )
            );

            if (progress >= 100) {
                clearInterval(interval);
                setFiles((prevFiles) => prevFiles.map((f) =>
                f.file === fileWithPreview.file ? {
                    ...f, succes: true } : f
                )
                );
            }
        }, 100
        );
    }

    const onDrop = useCallback (
        async(acceptedFiles: Files[]) => {
            const newFiles: FileWithPreview[] = [];

            for (const file of acceptedFiles) {
                if (files.length + newFiles.length >= maxFiles) {
                    break
                }
                const preview = await createdFilePreview(file)

                const FileWithPreview: FileWithPreview = {
                    file,
                    preview,
                    progress: 0
                }; 
                newFiles.push(FileWithPreview);
                simulateUpload(FileWithPreview)
            }
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            onChange?.(updatedFiles)
        },
        [files, maxFiles, onChange]
    )

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
    } = useDropzone({
        onDrop,
        accept,
        maxSize: maxSize * 1024 * 1024,
        multiple: true,
        disabled: disabled || files.length >= maxFiles

    })

  return (
    <div className='flex flex-col gap-5'>
        <Textarea rows={10} onChange={() => {}} />
        <Card>
            <CardHeader>
                <CardTitle> File Upload</CardTitle>
                <CardDescription> Drag and Drop files or click upload </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div {...getRootProps()} className={cn('relative flex flex-col items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-lg transition-colors',
                isDragActive
                ?"border-primary/5"
                : "border-muted/25",
                disabled && "opacity-50 cursor-not-allowed", "hover:bg-muted/50")}>
                    <input {...getInputProps} />
                <div>
                    <Upload />
                </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

export default FileUpload