// calc.c — toy calculator for the REA demo
// "200+10%" -> 220   "200-10%" -> 180   "200*10%" -> 20   "200/10%" -> 2000
#include <stdio.h>

static double apply(double a, char op, double b, int pct) {
    if (pct) {
        if (op == '+' || op == '-') b = a * b / 100.0; // % of the left operand
        else b = b / 100.0;                            // * and / use b as a fraction
    }
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b != 0 ? a / b : 0;
    }
    return 0;
}

int main(int argc, char **argv) {
    double a, b; char op, pct = 0;
    if (argc < 2 || sscanf(argv[1], "%lf%c%lf%c", &a, &op, &b, &pct) < 3) {
        fprintf(stderr, "usage: calc 200+10%%\n");
        return 1;
    }
    printf("%g\n", apply(a, op, b, pct == '%'));
    return 0;
}