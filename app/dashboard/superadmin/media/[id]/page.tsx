import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMediaForm from "./EditMediaForm";

export default async function EditMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const media = await prisma.mediaContent.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!media) {
    notFound();
  }

  return <EditMediaForm media={media} />;
}
