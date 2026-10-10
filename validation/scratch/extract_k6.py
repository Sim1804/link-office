import json

with open("validation/t2-load/raw/k6-summary.json") as f:
    d = json.load(f)

metrics = d.get("metrics", {})
print("=== K6 SUMMARY METRICS (relevant) ===")
for k, v in sorted(metrics.items()):
    vals = v.get("values", {})
    if any(kw in k for kw in ["questionnaire", "iris", "unexpected", "success", "submission", "http_req"]):
        print(f"\n{k}:")
        for vk, vv in sorted(vals.items()):
            print(f"  {vk}: {vv}")
