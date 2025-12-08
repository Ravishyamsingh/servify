import { useState, useRef } from "react";
import { Upload, X, Image, Video, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ImageUpload = ({ images, onImagesChange, maxFiles = 5, maxSizeMB = 10 }: ImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime"];
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported format. Use JPG, PNG, WEBP or MP4.`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxSizeMB}MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        // Check max files
        if (images.length + validFiles.length >= maxFiles) {
          toast({
            title: "Maximum files reached",
            description: `You can only upload up to ${maxFiles} files.`,
            variant: "destructive",
          });
          break;
        }

        validFiles.push(file);
        
        // Generate preview
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles]);
        setPreviews([...previews, ...newPreviews]);
        toast({
          title: "Files added",
          description: `${validFiles.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while processing your files.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(previews[index]);
    
    onImagesChange(newImages);
    setPreviews(newPreviews);
    
    toast({
      title: "File removed",
      description: "The file has been removed.",
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Processing files...</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">
              {isDragging ? "Drop files here" : "Drag & drop files here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: JPG, PNG, WEBP, MP4 (Max {maxSizeMB}MB each, up to {maxFiles} files)
            </p>
          </>
        )}
      </div>

      {/* File previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group rounded-xl overflow-hidden border border-border bg-secondary aspect-square"
            >
              {isImage(images[index]) ? (
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary">
                  <Video className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Video</span>
                </div>
              )}
              
              {/* Success indicator */}
              <div className="absolute top-2 left-2">
                <CheckCircle className="w-5 h-5 text-success drop-shadow-lg" />
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>

              {/* File name */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-xs text-white truncate">{images[index]?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
