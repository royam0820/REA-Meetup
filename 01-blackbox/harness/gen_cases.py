#!/usr/bin/env python3
"""Generate random probe cases for the black-box demo.

Writes cases.csv  ->  dist_m,vel_ms,material   (inputs only, no answers)

Usage:
    python3 gen_cases.py --n 2000 --seed 42 --out cases.csv
"""
import argparse
import csv
import random


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=2000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="cases.csv")
    args = ap.parse_args()

    rnd = random.Random(args.seed)
    rows = []
    for _ in range(args.n):
        dist = round(rnd.uniform(0.0, 1100.0), 3)   # includes out-of-range on purpose
        vel = round(rnd.uniform(0.0, 60.0), 3)
        material = rnd.randint(0, 3)
        rows.append((dist, vel, material))

    with open(args.out, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["dist_m", "vel_ms", "material"])
        w.writerows(rows)
    print(f"wrote {len(rows)} cases -> {args.out}")


if __name__ == "__main__":
    main()
