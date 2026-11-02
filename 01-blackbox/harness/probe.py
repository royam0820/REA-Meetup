#!/usr/bin/env python3
"""Run every case through the oracle binary -> expected.csv

This file is the ground truth used to score the agent's reimplementation.
Do NOT show expected.csv to the agent before the reveal (the demo is more
honest if it reconstructs first, then gets validated).

Usage:
    python3 probe.py --cases cases.csv --binary ./blackbox/oracle --out expected.csv
"""
import argparse
import csv
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cases", default="cases.csv")
    ap.add_argument("--binary", default="./blackbox/oracle")
    ap.add_argument("--out", default="expected.csv")
    args = ap.parse_args()

    rows = list(csv.DictReader(open(args.cases)))
    out = []
    for i, r in enumerate(rows):
        res = subprocess.run(
            [args.binary, r["dist_m"], r["vel_ms"], r["material"]],
            capture_output=True, text=True,
        )
        if res.returncode != 0:
            sys.exit(f"oracle failed on row {i}: {res.stderr.strip()}")
        out.append((r["dist_m"], r["vel_ms"], r["material"], res.stdout.strip().strip('"')))

    with open(args.out, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["dist_m", "vel_ms", "material", "expected"])
        w.writerows(out)
    print(f"wrote {len(out)} answers -> {args.out}")


if __name__ == "__main__":
    main()
