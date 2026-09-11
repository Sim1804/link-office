"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMediaContent(data: any) {
  try {
    if (!data.title || !data.slug) {
      return { success: false, error: "Le titre et le slug (URL) sont obligatoires." };
    }

    const existingMedia = await prisma.mediaContent.findUnique({
      where: { slug: data.slug }
    });

    if (existingMedia) {
      return { success: false, error: "Ce slug est déjà utilisé par un autre contenu. Veuillez le modifier." };
    }

    const media = await prisma.mediaContent.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        mediaType: data.mediaType,
        coverImage: data.coverImage,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        transcript: data.transcript,
        duration: data.duration ? parseInt(data.duration) : null,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
      }
    });

    // If categories are selected, connect them
    if (data.categories && data.categories.length > 0) {
      await prisma.mediaContent.update({
        where: { id: media.id },
        data: {
          categories: {
            connect: data.categories.map((id: string) => ({ id }))
          }
        }
      });
    }

    revalidatePath("/media");
    revalidatePath("/dashboard/superadmin/media");
    
    return { success: true, id: media.id };
  } catch (error: any) {
    console.error("Error creating media:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMediaContent(id: string, data: any) {
  try {
    if (!data.title || !data.slug) {
      return { success: false, error: "Le titre et le slug (URL) sont obligatoires." };
    }

    const existingMedia = await prisma.mediaContent.findUnique({
      where: { slug: data.slug }
    });

    if (existingMedia && existingMedia.id !== id) {
      return { success: false, error: "Ce slug est déjà utilisé par un autre contenu. Veuillez le modifier." };
    }

    const currentMedia = await prisma.mediaContent.findUnique({ where: { id } });
    if (!currentMedia) throw new Error("Média introuvable");

    // Only update publishedAt if it is being published for the first time
    const shouldUpdatePublishedAt = data.published && !currentMedia.published;

    const media = await prisma.mediaContent.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        mediaType: data.mediaType,
        coverImage: data.coverImage,
        audioUrl: data.audioUrl,
        videoUrl: data.videoUrl,
        transcript: data.transcript,
        duration: data.duration ? parseInt(data.duration) : null,
        published: data.published,
        ...(shouldUpdatePublishedAt ? { publishedAt: new Date() } : {})
      }
    });

    // If categories are selected, update them
    if (data.categories) {
      await prisma.mediaContent.update({
        where: { id: media.id },
        data: {
          categories: {
            set: [], // Clear existing
            connect: data.categories.map((categoryId: string) => ({ id: categoryId }))
          }
        }
      });
    }

    revalidatePath("/media");
    revalidatePath(`/media/${media.slug}`);
    revalidatePath("/dashboard/superadmin/media");
    
    return { success: true, id: media.id };
  } catch (error: any) {
    console.error("Error updating media:", error);
    return { success: false, error: error.message };
  }
}
