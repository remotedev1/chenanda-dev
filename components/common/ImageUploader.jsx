"use client";

import { useState, useEffect } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageKitUpload } from "@/hooks/useImageKitUpload";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { extractFileIdFromImageKitUrl } from "@/lib/imageKit";

export function ImageUploader({
  onUploadComplete,
  onImageRemove,
  folder = "/uploads",
  multiple = false,
  maxFiles = 10,
  existingImages = [], // Array of { url, fileId } or just urls
  showExisting = true,
}) {
  const [previews, setPreviews] = useState([]);
  const [existing, setExisting] = useState([]);
  const { uploadImage, uploadMultiple, uploading, progress } =
    useImageKitUpload();

  // Initialize existing images
  useEffect(() => {
    if (existingImages.length > 0) {
      const formatted = existingImages.map((img) => {
        if (typeof img === "string") {
          return {
            url: img.url,
            fileId: extractFileIdFromImageKitUrl(img.file),
          };
        }
        return img;
      });
      setExisting(formatted);
    }
  }, [existingImages]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check max files limit for multiple uploads
    if (multiple && existing.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    // For single upload, only allow one file
    if (!multiple && files.length > 1) {
      alert("Only one image allowed");
      return;
    }

    // Create previews
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews(newPreviews);

    try {
      let results;
      if (multiple) {
        results = await uploadMultiple(files, { folder });
      } else {
        results = await uploadImage(files[0], { folder });
        results = [results];
      }

      // Call the callback with uploaded images
      onUploadComplete?.(results);

      // For single upload, replace existing images
      if (!multiple) {
        setExisting(results);
      } else {
        // For multiple, add to existing
        setExisting((prev) => [...prev, ...results]);
      }

      // Clear previews after successful upload
      setPreviews([]);

      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setPreviews([]);
    }
  };

  const removePreview = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExisting = (index) => {
    const imageToRemove = existing[index];
    setExisting((prev) => prev.filter((_, i) => i !== index));

    // Notify parent component about removal
    onImageRemove?.(imageToRemove);
  };

  const canAddMore = multiple
    ? existing.length < maxFiles
    : existing.length === 0;

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {canAddMore && (
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById("image-upload").click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Select {multiple ? "Images" : "Image"}
              </>
            )}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple={multiple}
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {multiple && (
            <span className="text-sm text-muted-foreground">
              {existing.length} / {maxFiles} images
            </span>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{progress}% uploaded</p>
        </div>
      )}

      {/* Existing Images */}
      {showExisting && existing.length > 0 && (
        <div
          className={`grid gap-4 ${
            multiple
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {existing.map((image, index) => (
            <div key={image.fileId || image.url} className="relative group">
              <div
                className={`rounded-lg overflow-hidden border bg-white ${
                  multiple ? "aspect-square" : "h-32 w-48"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  width={multiple ? 200 : 192}
                  height={multiple ? 200 : 128}
                  className="object-contain w-full h-full p-2"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeExisting(index)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Images (during upload) */}
      {previews.length > 0 && (
        <div
          className={`grid gap-4 ${
            multiple
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div
                className={`rounded-lg overflow-hidden border ${
                  multiple ? "aspect-square" : "h-32 w-48"
                }`}
              >
                <Image
                  src={preview.preview}
                  alt={preview.name}
                  width={multiple ? 200 : 192}
                  height={multiple ? 200 : 128}
                  className="object-cover w-full h-full"
                />
              </div>
              {!uploading && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePreview(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
