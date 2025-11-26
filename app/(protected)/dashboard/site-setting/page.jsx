import { auth } from "@/auth";
import { defineAbilityFor } from "@/lib/ability/defineAbility";
import fs from "fs";
import path from "path";

// export const metadata = {
//   title: 'SEO Settings',
//   description: 'Update website logo, description, and keywords.',
// };

export default async function SiteSetting() {
  const user = await auth(); // Assuming you have a function to get the current user
  const ability = defineAbilityFor(user.role);

  // Read the existing data from the file
  const filePath = path.join(process.cwd(), "public", "data.js");
  let seoData = { logo: "", description: "", keywords: [] };

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    seoData = JSON.parse(fileContent);
  }

  // Server action for handling form submission
  async function handleUpdate(formData) {
    "use server"; // Enables server actions

    const updatedData = {
      description: formData.get("description"),
      keywords: formData
        .get("keywords")
        .split(",")
        .map((kw) => kw.trim()),
    };

    // Handle logo upload
    const logoFile = formData.get("logo");
    if (logoFile && logoFile.size > 0) {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      fs.writeFileSync(logoPath, buffer);
      updatedData.logo = "/logo.png"; // Save the path to the data
    } else {
      updatedData.logo = seoData.logo; // Retain existing logo if no new file is uploaded
    }

    // Write updated data to `data.js`
    const fileContent = JSON.stringify(updatedData, null, 2);
    try {
      fs.writeFileSync(filePath, fileContent, "utf-8");
    } catch (error) {
      console.error("Error updating SEO settings:", error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update SEO Settings</h1>
      <form action={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="logo" className="block font-medium mb-1">
            Upload Website Logo (PNG only)
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/png"
            className="block w-full"
          />
          {seoData.logo && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Current Logo:</p>
              <img
                src={seoData.logo}
                alt="Current Logo"
                className="h-16 w-16 object-contain border rounded"
              />
            </div>
          )}
        </div>
        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={seoData.description}
            className="border rounded w-full p-2"
            rows="3"
          />
        </div>
        <div>
          <label htmlFor="keywords" className="block font-medium mb-1">
            Keywords (comma-separated)
          </label>
          <input
            id="keywords"
            name="keywords"
            type="text"
            defaultValue={seoData.keywords.join(", ")}
            className="border rounded w-full p-2"
          />
        </div>
        {ability.can("delete", "Post") && (
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        )}
      </form>
    </div>
  );
}
