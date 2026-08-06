import { v2 as cloudinary } from 'cloudinary';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload une image vers Cloudinary depuis un buffer ou une data URI (base64)
 */
export async function uploadImage(
  fileStr: string,
  folder = 'job_flyers'
): Promise<{ url: string; public_id: string } | null> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: 'auto',
      // Optimisations automatiques
      format: 'webp',
      quality: 'auto:eco',
      width: 1200,
      crop: 'limit',
    });

    return {
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    return null;
  }
}

/**
 * Supprime une image de Cloudinary via son public_id
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Erreur suppression Cloudinary:', error);
    return false;
  }
}

export default cloudinary;
