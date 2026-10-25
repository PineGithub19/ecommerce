export function parseEnvOrigins(...values: (string | undefined)[]): string[] {
  const out: string[] = [];

  for (const value of values) {
    if (!value) {
      continue;
    }

    const origins = value.split(',').map((origin) => origin.trim());
    out.push(...origins);
  }

  return [...new Set(out)];
}
