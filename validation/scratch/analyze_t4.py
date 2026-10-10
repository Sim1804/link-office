"""Analyze T4 raw matrix-exec-results.json to categorize all divergences."""
import json
from collections import Counter

with open("validation/t4-authz/raw/matrix-exec-results.json") as f:
    results = json.load(f)

total = len(results)
passed = [r for r in results if r["passed"]]
failed = [r for r in results if not r["passed"]]

print(f"Total cells: {total}")
print(f"Passed: {len(passed)}")
print(f"Failed: {len(failed)}")
print()

# Categorize failures
categories = Counter()
forbidden_2xx = []
five_xx = []
four01_vs_403 = []
input_invalid = []
other_fails = []

for r in failed:
    exp = r["expected"]
    actual = r["actualStatus"]
    
    # Category 1: forbidden cell with 2xx
    if r.get("isForbiddenCell") and 200 <= actual < 300:
        categories["(1) forbidden_but_2xx"] += 1
        forbidden_2xx.append(r)
    # Category 2: 5xx responses
    elif actual >= 500:
        categories["(2) 5xx_error"] += 1
        five_xx.append(r)
    # Category 3: 401/403 interchangeable
    elif (exp in ("401", "401_OR_403") and actual == 403) or (exp == "403" and actual == 401) or (exp == "403_OR_404" and actual in (401, 403, 404)):
        categories["(3) 401_403_interchange"] += 1
        four01_vs_403.append(r)
    # Category 4: expected 2xx but got 4xx (possible invalid test input)
    elif exp == "2xx" and 400 <= actual < 500:
        categories["(4) expected_2xx_got_4xx"] += 1
        input_invalid.append(r)
    else:
        categories["(5) other"] += 1
        other_fails.append(r)

print("=== DIVERGENCE CATEGORIES ===")
for cat, count in sorted(categories.items()):
    print(f"  {cat}: {count}")

print(f"\n=== (1) FORBIDDEN BUT 2xx ({len(forbidden_2xx)} cells) ===")
for r in forbidden_2xx:
    print(f"  {r['method']:6s} {r['endpoint']:50s} {r['identity']:15s} expected={r['expected']:12s} actual={r['actualStatus']}")

print(f"\n=== (2) 5xx ERRORS ({len(five_xx)} cells) ===")
method_counts = Counter()
for r in five_xx:
    method_counts[r["method"]] += 1
for m, c in method_counts.most_common():
    print(f"  {m}: {c}")
# Show first 10
for r in five_xx[:10]:
    print(f"  {r['method']:6s} {r['endpoint']:50s} {r['identity']:15s} expected={r['expected']:12s} actual={r['actualStatus']}")
if len(five_xx) > 10:
    print(f"  ... and {len(five_xx) - 10} more")

print(f"\n=== (3) 401/403 INTERCHANGE ({len(four01_vs_403)} cells) ===")
for r in four01_vs_403[:10]:
    print(f"  {r['method']:6s} {r['endpoint']:50s} {r['identity']:15s} expected={r['expected']:12s} actual={r['actualStatus']}")
if len(four01_vs_403) > 10:
    print(f"  ... and {len(four01_vs_403) - 10} more")

print(f"\n=== (4) EXPECTED 2xx GOT 4xx ({len(input_invalid)} cells) ===")
for r in input_invalid[:10]:
    print(f"  {r['method']:6s} {r['endpoint']:50s} {r['identity']:15s} expected={r['expected']:12s} actual={r['actualStatus']}")
if len(input_invalid) > 10:
    print(f"  ... and {len(input_invalid) - 10} more")

print(f"\n=== (5) OTHER ({len(other_fails)} cells) ===")
for r in other_fails[:10]:
    print(f"  {r['method']:6s} {r['endpoint']:50s} {r['identity']:15s} expected={r['expected']:12s} actual={r['actualStatus']}")
if len(other_fails) > 10:
    print(f"  ... and {len(other_fails) - 10} more")
