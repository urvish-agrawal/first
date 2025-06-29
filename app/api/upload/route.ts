import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';  // Corrected fs import
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('Upload directory exists');
    }

    const uploadedFiles: string[] = [];

    // Process each file
    for (const file of files) {
      if (typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = await file.arrayBuffer();
        const uniqueName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`; // Replace spaces in filename
        const filePath = path.join(uploadDir, uniqueName);
        
        await fs.writeFile(filePath, Buffer.from(buffer));
        uploadedFiles.push(`/uploads/${uniqueName}`);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid files were uploaded' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        files: uploadedFiles,
        message: 'Files uploaded successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Upload failed',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}