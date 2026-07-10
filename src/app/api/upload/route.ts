import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files received." },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public/uploads");
    
    // Ensure the directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      console.error("Error creating uploads directory:", e);
    }

    const uploadedUrls = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create a unique filename to prevent overwriting
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      // Sanitize original filename
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${uniqueSuffix}-${safeFilename}`;
      
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Store the public URL
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}
