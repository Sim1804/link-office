import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config", "matching-settings.json");

const DEFAULT_CONFIG = {
  minimumThreshold: 75,
  synergyWeight: 60,
  similarityWeight: 40,
  geographicWeight: 0,
  ageWeight: 0
};

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!fs.existsSync(CONFIG_PATH)) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const data = fs.readFileSync(CONFIG_PATH, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("[MATCHING_CONFIG_GET_ERROR]", error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    
    // Assurer l'existence du dossier
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true, config: body });
  } catch (error) {
    console.error("[MATCHING_CONFIG_POST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
