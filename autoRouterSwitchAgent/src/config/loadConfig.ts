import { readFile } from "fs/promises";
import YAML from "yaml";
import { AppConfigSchema, type AppConfig } from "./schema.js";

export async function loadConfigFromFile(path: string): Promise<AppConfig> {
  const raw = await readFile(path, "utf8");
  const data = YAML.parse(raw);
  return AppConfigSchema.parse(data);
}
