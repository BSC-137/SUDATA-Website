
"""
Created by Shreejit Murthy on 17/01/2026

Rename files in a directory to incremental names (01.jpg, 02.jpg, 03.jpg, ...) for albums

Defaults:
- Renames all files in the target directory
- Sorts by filename.
- Keeps OG extensions.

Options:
- --ext jpg          Only include files with this extension (case-insensitive)
- --force-ext jpg    Force all renamed files to use this extension
- --start 1          Starting number
- --pad 2            Zero-padding width (2 => 01, 02, ...)
- --dry-run          Print what would happen without renaming
"""

import argparse
import os
from pathlib import Path
from typing import List, Tuple

def iter_files(dir_path: Path, only_ext: str | None) -> List[Path]:
    files = [p for p in dir_path.iterdir() if p.is_file()]
    if only_ext:
        only_ext = only_ext.lower().lstrip(".")
        files = [p for p in files if p.suffix.lower().lstrip(".") == only_ext]
    return sorted(files, key=lambda p: p.name.lower())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", nargs="?", default=".", help="Directory to process (default: current)")
    ap.add_argument("--ext", default=None, help="Only rename files with this extension (e.g. jpg)")
    ap.add_argument("--force-ext", default=None, help="Force output extension (e.g. jpg)")
    ap.add_argument("--start", type=int, default=1, help="Starting number (default: 1)")
    ap.add_argument("--pad", type=int, default=2, help="Zero pad width (default: 2)")
    ap.add_argument("--dry-run", action="store_true", help="Show planned renames without changing files")
    args = ap.parse_args()

    dir_path = Path(args.dir).expanduser().resolve()
    if not dir_path.exists() or not dir_path.is_dir():
        raise SystemExit(f"Not a directory: {dir_path}")

    files = iter_files(dir_path, args.ext)
    if not files:
        print("No files matched.")
        return 0

    force_ext = args.force_ext.lower().lstrip(".") if args.force_ext else None

    plan: List[Tuple[Path, Path]] = []
    for i, src in enumerate(files, start=args.start):
        num = str(i).zfill(args.pad)
        ext = force_ext if force_ext else src.suffix.lstrip(".")
        dst_name = f"{num}.{ext}" if ext else num
        dst = dir_path / dst_name
        plan.append((src, dst))

    src_set = {src.resolve() for src, _ in plan}
    for _, dst in plan:
        if dst.exists() and dst.resolve() not in src_set:
            raise SystemExit(f"Destination already exists and isn't being renamed too: {dst}")

    for src, dst in plan:
        print(f"{src.name} -> {dst.name}")

    if args.dry_run:
        print("Dry-run: no files were renamed.")
        return 0

    # two phase rename to avoid conflict
    temp_paths: List[Tuple[Path, Path, Path]] = []  # (src, tmp, dst)
    for src, dst in plan:
        tmp = dir_path / f".__renametmp__{src.name}__{os.getpid()}"
        src.rename(tmp)
        temp_paths.append((src, tmp, dst))

    for _, tmp, dst in temp_paths:
        tmp.rename(dst)

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
