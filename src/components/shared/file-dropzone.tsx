"use client";

import { useRef, useState } from "react";
import { File, FileText, Image as ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import type { Attachment } from "@/lib/mock-data/attachments";

type FileDropzoneProps = {
  files: Attachment[];
  onFilesChange: (files: Attachment[]) => void;
  className?: string;
};

const FILE_ICONS: Record<Attachment["type"], typeof File> = {
  image: ImageIcon,
  pdf: FileText,
  doc: FileText,
  other: File,
};

function getAttachmentType(file: File): Attachment["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type.includes("word") || file.type.includes("document")) return "doc";
  return "other";
}

export function FileDropzone({ files, onFilesChange, className }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const newAttachments: Attachment[] = Array.from(fileList).map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      type: getAttachmentType(file),
      tag: "geral",
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));

    onFilesChange([...files, ...newAttachments]);
  }

  function removeFile(id: string) {
    onFilesChange(files.filter((file) => file.id !== id));
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
        )}
      >
        <Upload className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">Arraste arquivos ou clique para enviar</p>
        <p className="text-muted-foreground text-xs">Imagens, PDFs ou documentos</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = FILE_ICONS[file.type];
            return (
              <div
                key={file.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <Icon className="text-muted-foreground size-4 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-muted-foreground text-xs">{file.sizeLabel}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeFile(file.id)}
                  aria-label={`Remover ${file.name}`}
                >
                  <X />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
