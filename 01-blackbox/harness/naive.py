"""Deliberately naive reconstruction — used on stage to show FAIL before PASS."""


def compute(dist_m, vel_ms, material):
    d = min(abs(dist_m), 1000.0)
    f = (1000.0 - d) / 1000.0
    return round(f * (1.0 + vel_ms * 0.01) * 1000.0) / 1000.0
