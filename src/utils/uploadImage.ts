import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';

interface UploadResult {
    url: string;
    publicId: string;
}

export const uploadToCloudinary = async (
    file: any,
    folder: string = 'products'
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result!.secure_url,
                        publicId: result!.public_id,
                    });
                }
            }
        );
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};