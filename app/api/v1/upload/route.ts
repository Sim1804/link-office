import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Verify file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Taille de fichier excessive (max 5 Mo)" }, { status: 400 });
    }

    // Verify it's an allowed image MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Format de fichier non autorisé (JPEG, PNG, WebP ou GIF uniquement)" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with safe extension
    const extension = file.type === "image/png" ? ".png" :
      file.type === "image/webp" ? ".webp" :
      file.type === "image/gif" ? ".gif" : ".jpg";

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = path.basename(file.name).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
    const filename = `${uniqueSuffix}-${baseName}${extension}`;
    
    // Path where the file will be saved (public/uploads/)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filepath = path.join(uploadDir, filename);

    // Save the file
    await writeFile(filepath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload du fichier" }, { status: 500 });
  }
}
