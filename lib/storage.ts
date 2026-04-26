import { supabase } from "./supabase";
import imageCompression from "browser-image-compression";

const BUCKET_NAME = "images";

export const storageService = {
  async uploadImages(files: File[]): Promise<string[]> { 
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200 };
      const compressedFile = await imageCompression(file, options);

      // Gebruik een tijdstempel + willekeurig getal voor een unieke naam in de hoofdmap
      const fileExt = "webp";
      const fileName = `uploads/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      uploadedUrls.push(data.publicUrl);
    }
    return uploadedUrls;
  },
  async listExistingImages() {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('uploads/', {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) throw error;
    
    return data
      .filter(item => item.name !== ".emptyFolderPlaceholder")
      .map((item) => ({
        ...item,
        // Belangrijk: voeg 'uploads/' toe aan het pad voor de URL
        url: supabase.storage.from(BUCKET_NAME).getPublicUrl(`uploads/${item.name}`).data.publicUrl,
      }));
  },
  

  // 3. Verwijder een foto (belangrijk voor die 1GB limiet!)
  async deleteImage(fileName: string) {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    if (error) throw error;
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 400, 
      useWebWorker: true,
      fileType: "image/webp",
    };

    try {
      const compressedFile = await imageCompression(file, options);
    
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/profile.webp`, compressedFile, {
          upsert: true 
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`${userId}/profile.webp`);
      return `${urlData.publicUrl}?t=${Date.now()}`; // Cache-buster toevoegen
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    }
  }
};

