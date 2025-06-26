import { FileWithPreview } from '@/types/file'
import React, { useCallback, useState } from 'react'
import { useDropzone } from "react-dropzone"
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { FileIcon, Loader2Icon, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { getAiResult } from '@/actions/getAiResult';

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
  value = [],
  onChange,
  onRemove,
  maxFiles = 1,
  maxSize = 20,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"] // Fixed typo: "aplication" -> "application"
  },
  disabled = false,
  className,
}: FileUploadProps) => {

  const [files, setFiles] = useState<FileWithPreview[]>(value);

  const [isLoading, setIsLoading ] = useState<boolean>(false)
  const [prompt, setPrompt] = useState<string>("")
  const [aiResult, setAiResult ] = useState<string>("")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => { // Fixed: Files[] -> File[]
      const newFiles: FileWithPreview[] = [];

      for (const file of acceptedFiles) {
        if (files.length + newFiles.length >= maxFiles) {
          break;
        }
        const preview = await createFilePreview(file);

        const fileWithPreview: FileWithPreview = {
            file,
            preview,
            progress: 0,
            succes: false
        };
        newFiles.push(fileWithPreview);
        simulateUpload(fileWithPreview);
      }
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, maxFiles, onChange]
  );

  const simulateUpload = (fileWithPreview: FileWithPreview) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === fileWithPreview.file
            ? { ...f, progress: Math.min(progress, 100) }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setFiles((prevFiles) => prevFiles.map((f) =>
          f.file === fileWithPreview.file ? {
            ...f, 
            success: true // Fixed typo: "succes" -> "success"
          } : f
        ));
      }
    }, 100);
  };

  const createFilePreview = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
    onRemove?.(updatedFiles);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    const result = await getAiResult(prompt, files[0].file)

    setAiResult(result);
    setIsLoading(false);

  }

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
    multiple: maxFiles > 1,
    disabled: disabled || files.length >= maxFiles
  });

  return (
    <div className='flex flex-col gap-5'>
        {aiResult && <p>{aiResult}</p> }
      <Textarea rows={10} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>Drag and Drop files or click upload</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div 
            {...getRootProps()} 
            className={cn(
              'relative flex flex-col items-center justify-center w-full h-32 p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25",
              isDragReject && "border-red-500 bg-red-50",
              disabled && "opacity-50 cursor-not-allowed", 
              "hover:bg-muted/50"
            )}
          >
            <input {...getInputProps()} /> {/* Fixed: removed extra curly braces */}
            <div className='flex flex-col items-center justify-center text-center'>
              <Upload className='size-8 mb-2 text-muted-foreground'/>
              <p className='text-sm font-medium'>
                {isDragActive 
                  ? "Drop files here..." 
                  : "Drag files here or click to upload"
                }
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Max {maxFiles} file(s), up to {maxSize}MB each
              </p>
            </div>
          </div>

          {/* File Rejections */}
          {fileRejections.length > 0 && (
            <div className='text-sm text-red-600'>
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name}>
                  {file.name}: {errors.map(e => e.message).join(', ')}
                </div>
              ))}
            </div>
          )}

          {/* File Preview */}
          {files.length > 0 && (
            <div className='space-y-2'>
              {files.map((file, index) => (
                <div 
                  key={`${file.file.name}-${index}`} 
                  className='flex items-center gap-3 p-3 border rounded-lg bg-muted/25' // Fixed className
                >
                  <div className='flex-shrink-0'>
                    {file.preview ? (
                      <div className='w-12 h-12 overflow-hidden rounded border'>
                        <img 
                          src={file.preview} 
                          alt={file.file.name} 
                          className='object-cover w-full h-full' 
                        />
                      </div>
                    ) : (
                      <div className='w-12 h-12 flex items-center justify-center border rounded bg-muted'>
                        <FileIcon className='size-5 text-muted-foreground'/>
                      </div>
                    )}
                  </div>
                  
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{file.file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    {file.progress !== undefined && file.progress < 100 && (
                      <div className='w-full bg-muted rounded-full h-1.5 mt-1'>
                        <div 
                          className='bg-primary h-1.5 rounded-full transition-all duration-300' 
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {file.succes && (
                      <p className='text-xs text-green-600 mt-1'>Upload complete</p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className='flex-shrink-0 p-1 hover:bg-muted rounded'
                    type="button"
                  >
                    <X className='size-4 text-muted-foreground hover:text-foreground' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter >
            <div className='flex w-full justify-between'>
                <p className='text-xs text-muted-foreground'>
{`${files.filter((f) => !f.error).length}/${maxFiles} files uploaded`}
                </p>
                <div>
                    <Button disabled={isLoading} onClick={onSubmit} >
                        {isLoading ? (
                           <Loader2Icon className='size-4 animate-spin' />
                        ) : (
                            "submit"
                        ) }
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FileUpload;