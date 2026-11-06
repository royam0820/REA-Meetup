"""Deliberately naive reconstruction — used on stage to show FAIL before PASS."""


def compute(dist_m, vel_ms, material):
    d = min(abs(dist_m), 1000.0) #plafonnement distance de 0 à 1000
    f = (1000.0 - d) / 1000.0 #facteur de réduction de distance entre 0.0 et 1.0
    return round(f * (1.0 + vel_ms * 0.01) * 1000.0) / 1000.0 #mise à l'échelle des données de sortie
