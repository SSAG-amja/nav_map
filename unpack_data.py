from __future__ import annotations

import gzip
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA_GZ_DIR = ROOT / "data_gz"
WEB_DATA_DIR = ROOT / "web" / "data"


def main() -> None:
    WEB_DATA_DIR.mkdir(parents=True, exist_ok=True)
    for src in sorted(DATA_GZ_DIR.glob("*.gz")):
        dst = WEB_DATA_DIR / src.name.removesuffix(".gz")
        with gzip.open(src, "rb") as source, dst.open("wb") as target:
            shutil.copyfileobj(source, target)
        print(f"unpacked: {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
