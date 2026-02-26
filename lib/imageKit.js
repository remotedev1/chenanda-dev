import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

// Get authentication parameters for client-side upload

// Delete a single file from ImageKit using REST API
export async function deleteImageKitFile(id) {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      throw new Error("ImageKit credentials not configured");
    }

    if (!id) {
      throw new Error("Invalid file ID or URL provided for deletion");
    }

    // console.log(`Attempting to delete ImageKit file with ID: ${id}`);
    // Create Basic Auth header
    const credentials = Buffer.from(`${privateKey}:`).toString("base64");

    const response = await fetch(`https://api.imagekit.io/v1/files/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete file: ${response.statusText}`,
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting ImageKit file:", error);
    throw error;
  }
}

// Delete multiple files from ImageKit
export async function deleteMultipleImageKitFiles(fileIds) {
  try {
    const deletePromises = fileIds.map((fileId) =>
      deleteImageKitFile(fileId).catch((err) => ({
        success: false,
        error: err.message,
        fileId,
      })),
    );
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple ImageKit files:", error);
    throw error;
  }
}

// Extract fileId from ImageKit URL
export function extractFileIdFromImageKitUrl(url) {
  try {
    if (!url) return null;

    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // ImageKit URL format: /your-imagekit-id/path/to/file.ext
    // Remove the leading slash and imagekit ID to get the filePath
    const pathParts = pathname.split("/").filter(Boolean);

    // The fileId is typically the full path after the ImageKit ID
    // Join all parts except the first one (which is the ImageKit ID)
    const filePath = pathParts.slice(1).join("/");

    return filePath;
  } catch (error) {
    console.error("Error extracting fileId:", error);
    return null;
  }
}

// Client-side helper to call delete API
export async function deleteImageFromClient(fileId) {
  try {
    const response = await fetch("/api/imagekit/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete image");
    }

    return data;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

// Client-side helper to delete multiple images
export async function deleteMultipleImagesFromClient(fileIds) {
  try {
    const deletePromises = fileIds.map((fileId) =>
      deleteImageFromClient(fileId).catch((err) => ({
        success: false,
        error: err.message,
        fileId,
      })),
    );
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    throw error;
  }
}
