#!/usr/bin/env python3
"""Score a reconstructed implementation against the oracle.

The agent must produce reimplementation.py exposing:

    def compute(dist_m: float, vel_ms: float, material: int) -> float

Usage:
    python3 verify.py --impl reimplementation.py --expected expected.csv

Exit code 0 = 100% match, 1 = mismatches.
"""
import argparse
import csv
import importlib.util
import math
import sys

TOL = 1e-3   # oracle quantizes to 3 decimals


def load_compute(path):
    spec = importlib.util.spec_from_file_location("reimpl", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if not hasattr(mod, "compute"):
        sys.exit(f"{path} does not define compute(dist_m, vel_ms, material)")
    return mod.compute


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--impl", default="reimplementation.py")
    ap.add_argument("--expected", default="expected.csv")
    ap.add_argument("--show", type=int, default=10, help="how many mismatches to print")
    args = ap.parse_args()

    compute = load_compute(args.impl)
    rows = list(csv.DictReader(open(args.expected)))

    ok = 0
    worst = 0.0
    bad = []
    for r in rows:
        d = float(r["dist_m"]); v = float(r["vel_ms"]); m = int(r["material"])
        want = float(r["expected"])
        try:
            got = float(compute(d, v, m))
        except Exception as e:                       # noqa: BLE001
            bad.append((d, v, m, want, f"EXC {e}"))
            continue
        err = abs(got - want)
        worst = max(worst, err)
        if math.isfinite(err) and err <= TOL:
            ok += 1
        else:
            bad.append((d, v, m, want, got))

    total = len(rows)
    pct = 100.0 * ok / total if total else 0.0
    print(f"match   : {ok}/{total}  ({pct:.2f}%)")
    print(f"max err : {worst:.6f}  (tol {TOL})")
    if bad:
        print(f"\nfirst {min(len(bad), args.show)} mismatches:")
        print(f"{'dist_m':>8} {'vel_ms':>8} {'mat':>3} {'expected':>10} {'got':>10}")
        for d, v, m, want, got in bad[: args.show]:
            g = f"{got:>10.6f}" if isinstance(got, float) else f"{got:>10}"
            print(f"{d:>8} {v:>8} {m:>3} {want:>10.6f} {g}")
        print(f"\nFAIL — {len(bad)} case(s) differ")
        return 1

    print(f"\nPASS — matches the binary on all {total} probe cases (tested, not proven for every input)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
