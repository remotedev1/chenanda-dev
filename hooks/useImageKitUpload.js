import { useState } from "react";
import { toast } from "sonner";

export function useImageKitUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file, options = {}) => {
    try {
      setUploading(true);
      setProgress(0);

      // Get auth parameters from your API
      const authResponse = await fetch("/api/imagekit/auth");
      const authData = await authResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", options.fileName || file.name);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire);
      formData.append("token", authData.token);

      // Optional: Add folder path
      if (options.folder) {
        formData.append("folder", options.folder);
      }

      // Optional: Add tags
      if (options.tags) {
        formData.append("tags", options.tags.join(","));
      }

      // Upload to ImageKit
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setUploading(false);
            setProgress(100);
            toast.success("Image uploaded successfully");
            resolve(response);
          } else {
            setUploading(false);
            toast.error("Upload failed");
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setUploading(false);
          toast.error("Upload failed");
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.send(formData);
      });
    } catch (error) {
      setUploading(false);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  const uploadMultiple = async (files, options = {}) => {
    const uploads = files.map((file) => uploadImage(file, options));
    return Promise.all(uploads);
  };

  return {
    uploadImage,
    uploadMultiple,
    uploading,
    progress,
  };
}