import prisma from "@/lib/prisma";
import type { SystemSettingModel } from "@/lib/generated/prisma/models/SystemSetting";

/**
 * Get a setting value by key, returning defaultValue if not found
 */
export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });

  return setting?.value ?? defaultValue;
}

/**
 * Set a setting value by key (upsert)
 */
export async function setSetting(key: string, value: string): Promise<SystemSettingModel> {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Get all settings as a record
 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.systemSetting.findMany();
  return settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>,
  );
}
