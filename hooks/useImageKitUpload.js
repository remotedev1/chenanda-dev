import { useState } from "react";
import { toast } from "sonner";

export function useImageKitUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file, options = {}) => {
    setUploading(true);
    setProgress(0);

    try {
      const authResponse = await fetch("/api/imagekit/auth");
      if (!authResponse.ok) throw new Error("Auth fetch failed");
      const authData = await authResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", options.fileName || file.name);
      formData.append("signature", authData.signature);
      formData.append("expire", String(authData.expire));
      formData.append("token", authData.token);

      if (options.folder) formData.append("folder", options.folder);
      if (options.tags) formData.append("tags", options.tags.join(","));

      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
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
            // ✅ Log the actual ImageKit error message
            const errBody = JSON.parse(xhr.responseText || "{}");
            console.error("ImageKit error:", errBody);
            setUploading(false);
            toast.error(errBody?.message || "Upload failed");
            reject(new Error(errBody?.message || "Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          setUploading(false);
          toast.error("Network error during upload");
          reject(new Error("Network error"));
        });

        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

        // ✅ Required: Basic Auth header with your public key
        const encoded = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}:`);
        xhr.setRequestHeader("Authorization", `Basic ${encoded}`);

        xhr.send(formData);
      });
    } catch (error) {
      setUploading(false);
      toast.error("Failed to upload image");
      throw error;
    }
  };

  const uploadMultiple = async (files, options = {}) => {
    return Promise.all(files.map((file) => uploadImage(file, options)));
  };

  return { uploadImage, uploadMultiple, uploading, progress };
}
