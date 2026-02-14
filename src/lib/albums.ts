import type { ImageMetadata } from "astro";

type AlbumImage = { src: ImageMetadata; alt?: string };

function byFilename(a: string, b: string) {
  // sorts by the filename portion, which works great with the incremental setup we got
  const fa = a.split("/").pop() ?? a;
  const fb = b.split("/").pop() ?? b;
  return fa.localeCompare(fb, undefined, { numeric: true, sensitivity: "base" });
}

export function loadAlbum(glob: Record<string, unknown>, altPrefix = "Photo"): AlbumImage[] {
  return Object.entries(glob)
    .sort(([a], [b]) => byFilename(a, b))
    .map(([path, mod], i) => {
      // when we use import: "default", the value is ImageMetadata
      const src = mod as ImageMetadata;
      return { src, alt: `${altPrefix} ${i + 1}` };
    });
}
