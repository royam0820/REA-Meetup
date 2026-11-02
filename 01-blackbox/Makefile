CC      ?= cc
CFLAGS  ?= -O2 -fno-asynchronous-unwind-tables
LDFLAGS ?=

SRC   := ../.verity/blackbox.c
BIN   := oracle
UNAME := $(shell uname -s)

ifeq ($(UNAME),Darwin)
LDFLAGS += -lm
STRIP    = strip -x
else
LDFLAGS += -lm
STRIP    = strip --strip-all
endif

all: $(BIN)

$(BIN): $(SRC)
	$(CC) $(CFLAGS) -o $@ $(SRC) $(LDFLAGS)
	$(STRIP) $@
	@echo "built $(BIN) ($(UNAME), stripped): $$(wc -c < $@) bytes"

clean:
	rm -f $(BIN)

.PHONY: all clean
