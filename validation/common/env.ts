/**
 * @file env.ts
 * @module validation/common/env
 * @description Générateur standardisé des métadonnées d'environnement (env.json)
 * pour l'ensemble des bancs de test de validation.
 */

import os from "os";
import { execSync } from "child_process";

export const PROTOCOL_COMMIT_HASH = "c0e778360bb2a46460530c07602e6571d1ba47c5";
export const PROTOCOL_SHA256 = "FCCF595FBCD9978240CB90837C893CD1A9548D258E92BF284B6C1015BAEB952E";

export interface EnvironmentMetadata {
  gitCommit: string;
  protocolCommit: string;
  protocolSha256: string;
  timestamp: string;
  machine: {
    platform: string;
    release: string;
    cpuModel: string;
    cpuCores: number;
    totalMemoryGb: number;
    freeMemoryGb: number;
    nodeVersion: string;
  };
  providerModel?: string | null;
  pricingConsultation?: {
    url: string;
    date: string;
  } | null;
}

export function getEnvironmentMetadata(extra?: {
  providerModel?: string | null;
  pricingConsultation?: { url: string; date: string } | null;
}): EnvironmentMetadata {
  let gitCommit = "unknown";
  try {
    gitCommit = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {}

  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : "unknown";
  const totalMemoryGb = Math.round((os.totalmem() / (1024 * 1024 * 1024)) * 100) / 100;
  const freeMemoryGb = Math.round((os.freemem() / (1024 * 1024 * 1024)) * 100) / 100;

  return {
    gitCommit,
    protocolCommit: PROTOCOL_COMMIT_HASH,
    protocolSha256: PROTOCOL_SHA256,
    timestamp: new Date().toISOString(),
    machine: {
      platform: os.platform(),
      release: os.release(),
      cpuModel,
      cpuCores: cpus.length,
      totalMemoryGb,
      freeMemoryGb,
      nodeVersion: process.version,
    },
    providerModel: extra?.providerModel || null,
    pricingConsultation: extra?.pricingConsultation || null,
  };
}
