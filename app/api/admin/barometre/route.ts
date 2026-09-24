import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "ALL";
    const type = searchParams.get("type") || "ALL";
    const period = searchParams.get("period") || "ALL";

    // Date Filtering
    let dateFilter = {};
    if (period === "last_30_days") {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      dateFilter = { gte: date };
    } else if (period === "this_year") {
      const date = new Date(new Date().getFullYear(), 0, 1);
      dateFilter = { gte: date };
    }

    // Organization Type Filtering
    let userFilter = {};
    if (type === "B2C") {
      userFilter = { organizationId: null };
    } else if (type !== "ALL") {
      userFilter = { organization: { type: type } };
    }

    // Region Filtering
    let demoFilter = {};
    if (region !== "ALL") {
      demoFilter = { department: region };
    }

    // Fetch Assessments
    const assessments = await prisma.assessment.findMany({
      where: {
        status: "SUBMITTED",
        result: { isNot: null },
        submittedAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        user: Object.keys(userFilter).length > 0 ? userFilter : undefined,
        demographic: Object.keys(demoFilter).length > 0 ? demoFilter : undefined,
      },
      include: {
        result: true,
        demographic: true,
      },
      orderBy: { submittedAt: "asc" },
    });

    const totalPassages = assessments.length;

    if (totalPassages === 0) {
      return NextResponse.json({
        totalPassages: 0,
        globalAverage: 0,
        dimensions: { social: 0, affective: 0, sentimental: 0, professional: 0, self: 0 },
        regions: [],
        timeline: [],
      });
    }

    let globalSum = 0;
    let socialSum = 0;
    let affectiveSum = 0;
    let sentimentalSum = 0;
    let professionalSum = 0;
    let selfSum = 0;

    const regionsMap: Record<string, { count: number; sum: number }> = {};
    const timelineMap: Record<string, number> = {};
    const profilsMap: Record<string, number> = {};

    for (const assessment of assessments) {
      const result = assessment.result!;
      globalSum += result.globalScore;
      socialSum += result.socialScore;
      affectiveSum += result.affectiveScore;
      sentimentalSum += result.sentimentalScore;
      professionalSum += result.professionalScore;
      selfSum += result.selfScore;

      // Regions
      const dept = assessment.demographic?.department || "Non renseigné";
      if (!regionsMap[dept]) regionsMap[dept] = { count: 0, sum: 0 };
      regionsMap[dept].count += 1;
      regionsMap[dept].sum += result.globalScore;

      // Timeline (Group by Date YYYY-MM-DD)
      const dateKey = assessment.submittedAt!.toISOString().split("T")[0];
      if (!timelineMap[dateKey]) timelineMap[dateKey] = 0;
      timelineMap[dateKey] += 1;

      // Profils
      const profile = result.primaryProfile || "Non défini";
      if (!profilsMap[profile]) profilsMap[profile] = 0;
      profilsMap[profile] += 1;
    }

    const regions = Object.entries(regionsMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        average: Math.round(data.sum / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15

    const timeline = Object.entries(timelineMap).map(([date, passages]) => ({
      date,
      passages,
    }));

    const COLORS = ["#10b981", "var(--primary)", "#f59e0b", "#ef4444", "#a855f7"];
    const profils = Object.entries(profilsMap)
      .map(([name, count], index) => ({
        name,
        count,
        value: Math.round((count / totalPassages) * 100),
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      totalPassages,
      globalAverage: Math.round(globalSum / totalPassages),
      dimensions: {
        social: Math.round(socialSum / totalPassages),
        affective: Math.round(affectiveSum / totalPassages),
        sentimental: Math.round(sentimentalSum / totalPassages),
        professional: Math.round(professionalSum / totalPassages),
        self: Math.round(selfSum / totalPassages),
      },
      regions,
      timeline,
      profils,
    });
  } catch (error) {
    console.error("Barometre API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
