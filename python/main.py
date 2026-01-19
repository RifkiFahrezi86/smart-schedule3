#!/usr/bin/env python3
# =============================================
# SMART SCHEDULING - PYTHON ENGINE
# =============================================

import sys
import json
from scheduler import run_daily, run_weekly, run_monthly

def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "errors": [{"type": "System", "message": "Invalid arguments"}]
        }))
        sys.exit(1)

    mode = sys.argv[1]
    payload = json.loads(sys.argv[2])

    try:
        if mode == "daily":
            result = run_daily(payload)
        elif mode == "weekly":
            result = run_weekly(payload)
        elif mode == "monthly":
            result = run_monthly(payload)
        else:
            result = {
                "success": False,
                "errors": [{"type": "System", "message": f"Unknown mode: {mode}"}]
            }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "errors": [{"type": "System", "message": str(e)}]
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()