import { readFile } from "fs/promises";
import YAML from "yaml";
import { RulesFileSchema, type RulesFile } from "./schema.js";

export async function loadRulesFromFile(path: string): Promise<RulesFile> {
  const raw = await readFile(path, "utf8");
  return RulesFileSchema.parse(YAML.parse(raw));
}
