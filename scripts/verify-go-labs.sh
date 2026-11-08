#!/usr/bin/env bash
# Verifies every Go lab under prisma/seed/tracks/backend/labs:
#   1. the starter code compiles (learners see failing tests, not build errors)
#   2. the starter FAILS the tests (otherwise the lab teaches nothing)
#   3. the reference solution passes go vet and go test -race
#
# Usage: npm run labs:verify   (needs Go >= 1.22 and gcc for -race)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABS_DIR="$ROOT/prisma/seed/tracks/backend/labs"
GO_VERSION_DIRECTIVE="1.22"
only="${1:-}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

failures=0
for lab in "$LABS_DIR"/*/; do
  name="$(basename "$lab")"
  [[ -n "$only" && "$name" != "$only" ]] && continue

  dir="$work/$name"
  mkdir -p "$dir"
  find "$lab" -maxdepth 1 -type f -name '*.go' -exec cp {} "$dir/" \;
  printf 'module example.com/lab\n\ngo %s\n' "$GO_VERSION_DIRECTIVE" > "$dir/go.mod"

  if ! (cd "$dir" && go build ./... >/dev/null 2>&1); then
    echo "FAIL $name: starter does not compile"
    (cd "$dir" && go build ./... 2>&1 | head -20) || true
    failures=$((failures + 1))
    continue
  fi

  if (cd "$dir" && GOFLAGS=-count=1 go test -race -timeout 60s ./... >/dev/null 2>&1); then
    echo "FAIL $name: starter already passes the tests"
    failures=$((failures + 1))
    continue
  fi

  cp "$lab"/solution/*.go "$dir/"
  if ! (cd "$dir" && go vet ./... && GOFLAGS=-count=1 go test -race -timeout 60s ./...) >"$dir/.out" 2>&1; then
    echo "FAIL $name: reference solution does not pass"
    sed -n '1,40p' "$dir/.out"
    failures=$((failures + 1))
    continue
  fi
  echo "ok   $name"
done

if [[ $failures -gt 0 ]]; then
  echo "$failures lab(s) failed verification"
  exit 1
fi
