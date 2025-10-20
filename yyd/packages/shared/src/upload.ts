import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface UploadOptions {
  folder: 'tours' | 'vouchers' | 'guides' | 'fleet';
  maxSize?: number; // in bytes, default 5MB
  allowedTypes?: string[];
}

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

    // Validate file size
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      };
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const randomName = randomBytes(16).toString('hex');
    const filename = `${randomName}.${ext}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload path
    const uploadDir = join(process.cwd(), 'public', 'uploads', options.folder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return public URL
    const url = `/uploads/${options.folder}/${filename}`;

    return {
      success: true,
      url,
      filename,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

export async function deleteFile(url: string): Promise<boolean> {
  try {
    const { unlink } = await import('fs/promises');
    const filePath = join(process.cwd(), 'public', url);
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}
