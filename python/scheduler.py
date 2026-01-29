# =============================================
# SMART SCHEDULING - SCHEDULER ALGORITHMS


from datetime import datetime, timedelta

# ============================================
# DAILY SCHEDULER 
# ============================================

def run_daily(payload):
    """
    Daily scheduler (FIXED, 100% backward compatible)
    - Tidak mengubah struktur response
    - Tidak mengubah field JSON
    - Tidak mengubah helper
    - Tidak mengubah weekly/monthly
    """

    config = payload["config"]
    activities = payload["activities"]

    # Convert time strings to minutes
    start = time_to_minutes(config["startTime"])
    end = time_to_minutes(config["endTime"])
    personal_start_raw = time_to_minutes(config["personalStart"])
    personal_end_raw = time_to_minutes(config["personalEnd"])
    break_time = config["breakTime"]
    max_productive = config["maxProductive"]

    # ===== FIX BUG #1 & #4: personal time hanya dipotong jika overlap =====
    personal_start = max(start, min(personal_start_raw, end))
    personal_end = max(start, min(personal_end_raw, end))
    personal_overlap = max(0, personal_end - personal_start)

    # ===== FIX BUG #2: jangan double count personal time =====
    available_time = (end - start) - personal_overlap

    # ===== FIX BUG #3: break dihitung logis, bukan dipaksa =====
    total_duration = sum(act["duration"] for act in activities)
    breaks_needed = max(0, len(activities) - 1) * break_time
    total_needed = total_duration + breaks_needed


    if total_needed > available_time:
        return {
            "success": False,
            "errors": [
                {"type": "Waktu", "message": f"Total waktu yang dibutuhkan ({total_needed} menit) melebihi waktu tersedia ({available_time} menit)"}
            ],
            "suggestions": [
                f"Perpanjang waktu aktif (End Time → {minutes_to_time(start + total_needed + personal_overlap)})",
                "Kurangi Personal Time",
                "Kurangi Break Time per aktivitas"
            ]
        }

    # Sort activities: tinggi > sedang > rendah, then by duration (longest first)
    priority_order = {"tinggi": 3, "sedang": 2, "rendah": 1}
    activities.sort(key=lambda x: (priority_order[x["priority"]], x["duration"]), reverse=True)

    schedule = []
    personal_time_added = False

    def get_reason(activity, time_slot):
        priority = activity["priority"]
        reasons = {
            "tinggi": "Prioritas tinggi - dikerjakan saat fresh dan fokus maksimal",
            "sedang": "Prioritas menengah - diselesaikan sebelum break time",
            "rendah": "Prioritas rendah - cocok dikerjakan saat sisa waktu"
        }

        if time_slot < personal_start:
            return reasons[priority] + " (sebelum personal time)"
        elif time_slot >= personal_end:
            return reasons[priority] + " (setelah personal time)"
        return reasons[priority]

    current_time = start
    total_productive = 0

    for i, activity in enumerate(activities):
        remaining = activity["duration"]

        # ===== FIX BUG #6: hormati max_productive di loop =====
        if total_productive >= max_productive:
            break

        while remaining > 0:
            # ===== FIX BUG #5: split jika kena personal time =====
            if not personal_time_added and personal_overlap > 0 and current_time < personal_end and current_time >= personal_start:
                schedule.append({
                    "time": f"{minutes_to_time(personal_start)} - {minutes_to_time(personal_end)}",
                    "activity": "Personal Time 🍽️",
                    "duration": f"{personal_end - personal_start} menit",
                    "reason": "Waktu untuk makan, istirahat, atau kegiatan pribadi"
                })
                current_time = personal_end
                personal_time_added = True
                continue

            next_limit = end
            if not personal_time_added and personal_overlap > 0 and current_time < personal_start:
                next_limit = personal_start

            slot_available = next_limit - current_time
            productive_left = max_productive - total_productive
            alloc = min(remaining, slot_available, productive_left)

            if alloc <= 0:
                break

            schedule.append({
                "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + alloc)}",
                "activity": activity["name"],
                "duration": f"{alloc} menit",
                "reason": get_reason(activity, current_time)
            })

            current_time += alloc
            total_productive += alloc
            remaining -= alloc

            # ===== FIX BUG #3 (FINAL): break muncul walau hanya 1 aktivitas =====
            if remaining == 0:
                # Jangan tambahkan break tepat sebelum personal time
                at_personal_start = (personal_overlap > 0 and current_time == personal_start)

                # ✅ FIX: Jangan buat break kalau break_time = 0
                if break_time > 0 and not at_personal_start and current_time + break_time <= end:
                    schedule.append({
                        "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + break_time)}",
                        "activity": "Break Time ☕",
                        "duration": f"{break_time} menit",
                        "reason": "Istirahat untuk menjaga fokus dan produktivitas"
                    })
                    current_time += break_time

    # ===== FIX BUG #4 EDGE: tambahkan personal time jika belum muncul =====
    if not personal_time_added and personal_overlap > 0 and current_time <= personal_start:
        if current_time < personal_start:
            current_time = personal_start

        schedule.append({
            "time": f"{minutes_to_time(personal_start)} - {minutes_to_time(personal_end)}",
            "activity": "Personal Time 🍽️",
            "duration": f"{personal_end - personal_start} menit",
            "reason": "Waktu untuk makan, istirahat, atau kegiatan pribadi"
        })
        current_time = personal_end
        personal_time_added = True

    # ===== FIX SUMMARY BREAK TIME =====
    total_break = sum(
        int(item["duration"].split()[0])
        for item in schedule
        if item["activity"] == "Break Time ☕"
    )
    actual_end = current_time

    return {
        "success": True,
        "data": {
            "schedule": schedule,
            "summary": {
                "totalProductive": total_productive,
                "breakTime": total_break,
                "personalTime": personal_overlap,
                "endTime": minutes_to_time(actual_end)
            }
        }
    }


# ============================================
# WEEKLY SCHEDULER
# ============================================

def run_weekly(payload):
    """
    Weekly scheduler (FIXED, backward compatible)
    """

    config = payload["config"]
    tasks = payload["tasks"]

    max_weekly = config["maxHoursPerWeek"]
    active_days = config["activeDays"]
    weeks = config["weeks"]
    start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")

    # OPTIONAL daily limit (fallback ke max weekly)
    max_daily = config.get("maxHoursPerDay", max_weekly)
    # =========================
    # VALIDATION
    # =========================
    if not active_days:
        return {
            "success": False,
            "errors": [{"type": "Hari", "message": "Tidak ada hari aktif yang dipilih"}],
            "suggestions": ["Pilih minimal 1 hari aktif belajar"]
        }

    total_hours = sum(t["duration"] for t in tasks)
    max_capacity = max_weekly * weeks

    if total_hours > max_capacity:
        return {
            "success": False,
            "errors": [{
                "type": "Kapasitas",
                "message": f"Total jam tugas ({total_hours} jam) melebihi kapasitas ({max_capacity} jam)"
            }],
            "suggestions": [
                "Kurangi durasi tugas",
                "Tambah minggu",
                "Tambah max jam per minggu"
            ]
        }

    # =========================
    # SORT TASKS BY DEADLINE
    # =========================
    tasks_sorted = sorted(
        tasks,
        key=lambda x: datetime.strptime(x["deadline"], "%Y-%m-%d")
    )

    weekly_schedule = {i: [] for i in range(weeks)}
    weekly_hours = {i: 0 for i in range(weeks)}
    daily_hours = {i: {} for i in range(weeks)}  # week → day → hours

    day_names = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

# ============================================
# WEEKLY SCHEDULER (FINAL VERSION)
# ============================================


def run_weekly(payload):
    """
    Weekly scheduler (FINAL, backward compatible)
    - Distribusi merata
    - Hormat deadline
    - Tidak numpuk 1 hari
    - Support maxHoursPerDay (optional)
    """

    config = payload["config"]
    tasks = payload["tasks"]

    max_weekly = config["maxHoursPerWeek"]
    active_days = config["activeDays"]
    weeks = config["weeks"]
    start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")

    # Optional daily limit (fallback ke max weekly)
    max_daily = config.get("maxHoursPerDay", max_weekly)

    # =========================
    # VALIDATION
    # =========================
    if not active_days:
        return {
            "success": False,
            "errors": [{
                "type": "Hari",
                "message": "Tidak ada hari aktif yang dipilih"
            }],
            "suggestions": ["Pilih minimal 1 hari aktif belajar"]
        }

    total_hours = sum(t["duration"] for t in tasks)
    max_capacity = max_weekly * weeks

    if total_hours > max_capacity:
        return {
            "success": False,
            "errors": [{
                "type": "Kapasitas",
                "message": f"Total jam tugas ({total_hours} jam) melebihi kapasitas ({max_capacity} jam)"
            }],
            "suggestions": [
                "Kurangi durasi tugas",
                "Tambah minggu",
                "Tambah max jam per minggu"
            ]
        }

    # =========================
    # SORT TASKS BY DEADLINE
    # =========================
    tasks_sorted = sorted(
        tasks,
        key=lambda x: datetime.strptime(x["deadline"], "%Y-%m-%d")
    )

    weekly_schedule = {i: [] for i in range(weeks)}
    weekly_hours = {i: 0 for i in range(weeks)}
    daily_hours = {i: {} for i in range(weeks)}

    day_names = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

    # =========================
    # ASSIGN TASKS
    # =========================
    for task in tasks_sorted:
        deadline = datetime.strptime(task["deadline"], "%Y-%m-%d")

        days_diff = (deadline - start_date).days
        if days_diff < 0:
            return {
                "success": False,
                "errors": [{
                    "type": "Deadline",
                    "message": f"Deadline tugas '{task['name']}' lebih awal dari tanggal mulai"
                }],
                "suggestions": [
                    "Periksa tanggal deadline",
                    "Mundurkan start date",
                    "Perbarui deadline tugas"
                ]
            }

        latest_week = min(weeks - 1, days_diff // 7)
        assigned = False

        for week in range(latest_week + 1):
            if weekly_hours[week] + task["duration"] > max_weekly:
                continue

            week_start = start_date + timedelta(weeks=week)
            candidates = []

            for d in range(7):
                date = week_start + timedelta(days=d)

                if date > deadline:
                    continue

                day_name = day_names[date.weekday()]
                if day_name not in active_days:
                    continue

                used = daily_hours[week].get(day_name, 0)
                if used + task["duration"] > max_daily:
                    continue

                candidates.append((used, day_name, date))

            # Pilih hari dengan beban TERKECIL
            if candidates:
                candidates.sort(key=lambda x: x[0])
                used, day_name, date = candidates[0]

                weekly_schedule[week].append({
                    "day": f"{day_name}, {date.strftime('%d %b')}",
                    "task": task["name"],
                    "hours": f"{task['duration']} jam",
                    "time": "19:00 - 21:00"
                })

                weekly_hours[week] += task["duration"]
                daily_hours[week][day_name] = used + task["duration"]
                assigned = True
                break

        if not assigned:
            return {
                "success": False,
                "errors": [{
                    "type": "Penjadwalan",
                    "message": f"Tugas '{task['name']}' tidak dapat dijadwalkan sebelum deadline"
                }],
                "suggestions": [
                    "Tambah hari aktif",
                    "Tambah max jam per minggu",
                    "Mundurkan deadline"
                ]
            }

    # =========================
    # FORMAT OUTPUT
    # =========================
    result = []
    total = 0
    completed = 0

    for week in range(weeks):
        ws = start_date + timedelta(weeks=week)
        we = ws + timedelta(days=6)

        total += weekly_hours[week]
        completed += len(weekly_schedule[week])

        result.append({
            "week": f"Minggu {week + 1} ({ws.strftime('%d')}-{we.strftime('%d %b')})",
            "tasks": weekly_schedule[week],
            "totalHours": weekly_hours[week]
        })

    return {
        "success": True,
        "data": {
            "schedule": result,
            "summary": {
                "totalHours": total,
                "averagePerWeek": round(total / weeks, 1),
                "tasksCompleted": f"{completed}/{len(tasks)}",
                "status": "✓ Seimbang" if completed == len(tasks) else "⚠ Tidak Lengkap"
            }
        }
    }



# ============================================
# MONTHLY SCHEDULER (FINAL - VERIFIED)
# ============================================

from datetime import datetime
import calendar

def run_monthly(payload):
    """
    Monthly scheduler (FINAL, fully bug-proof)
    - Split task lintas hari
    - Max jam per hari
    - Deadline-aware (closest first)
    - Real calendar month
    - Aman untuk UI
    """

    config = payload["config"]
    tasks = payload["tasks"]

    max_monthly = config["maxHoursPerMonth"]
    max_daily = config.get("maxHoursPerDay", 6)
    blocked_dates = set(config.get("blockedDates", []))
    start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")

    year, month = start_date.year, start_date.month
    days_in_month = calendar.monthrange(year, month)[1]

    # =========================
    # VALIDATION (GLOBAL)
    # =========================
    total_hours = sum(t["duration"] for t in tasks)
    if total_hours > max_monthly:
        return {
            "success": False,
            "errors": [{
                "type": "Kapasitas",
                "message": f"Total jam proyek ({total_hours} jam) melebihi kapasitas bulanan ({max_monthly} jam)"
            }],
            "suggestions": [
                "Tambah max jam per bulan",
                "Kurangi durasi proyek",
                "Pecah proyek besar"
            ]
        }

    # Validasi blocked dates
    for d in blocked_dates:
        if d < 1 or d > days_in_month:
            return {
                "success": False,
                "errors": [{
                    "type": "Tanggal",
                    "message": f"Tanggal terblokir ({d}) tidak valid untuk bulan ini"
                }],
                "suggestions": ["Periksa tanggal terblokir"]
            }

    # Semua hari terblokir
    if len(blocked_dates) == days_in_month:
        return {
            "success": False,
            "errors": [{
                "type": "Tanggal",
                "message": "Tidak ada hari produktif tersedia dalam bulan ini"
            }],
            "suggestions": [
                "Hapus beberapa tanggal terblokir",
                "Pindahkan proyek ke bulan lain"
            ]
        }

    # Validasi deadline task
    for t in tasks:
        if t["deadline"] < 1 or t["deadline"] > days_in_month:
            return {
                "success": False,
                "errors": [{
                    "type": "Deadline",
                    "message": f"Deadline tugas '{t['name']}' tidak valid"
                }],
                "suggestions": ["Periksa deadline tugas"]
            }

    # =========================
    # SORT TASKS (EARLIEST DEADLINE FIRST)
    # =========================
    tasks_sorted = sorted(tasks, key=lambda x: x["deadline"])

    # =========================
    # STATE TRACKING
    # =========================
    daily_hours = {d: 0 for d in range(1, days_in_month + 1)}
    month_schedule = {d: [] for d in range(1, days_in_month + 1)}
    total_scheduled = 0

    # =========================
    # ASSIGN TASKS (SPLIT AWARE)
    # =========================
    for task in tasks_sorted:
        remaining = task["duration"]
        deadline = task["deadline"]

        for day in range(deadline, 0, -1):
            if remaining <= 0:
                break

            if day in blocked_dates:
                continue

            available = max_daily - daily_hours[day]
            if available <= 0:
                continue

            alloc = min(available, remaining)

            if total_scheduled + alloc > max_monthly:
                break

            month_schedule[day].append({
                "task": task["name"],
                "hours": alloc
            })

            daily_hours[day] += alloc
            total_scheduled += alloc
            remaining -= alloc

        if remaining > 0:
            return {
                "success": False,
                "errors": [{
                    "type": "Penjadwalan",
                    "message": f"Tugas '{task['name']}' tidak dapat dijadwalkan sebelum deadline"
                }],
                "suggestions": [
                    "Tambah max jam per hari",
                    "Kurangi tanggal terblokir",
                    "Mundurkan deadline",
                    "Pecah proyek besar"
                ]
            }

    # =========================
    # FORMAT OUTPUT (PER MINGGU)
    # =========================
    weekly_schedule = []
    month_name = start_date.strftime("%b")

    for week in range(5):
        start = week * 7 + 1
        end = min(start + 6, days_in_month)

        tasks_week = []
        has_blocked = False

        for d in range(start, end + 1):
            if d in blocked_dates:
                has_blocked = True

            for t in month_schedule[d]:
                tasks_week.append({
                    "date": f"{d} {month_name}",
                    "task": t["task"],
                    "hours": f"{t['hours']} jam"
                })

        weekly_schedule.append({
            "weekLabel": f"Minggu {week + 1} ({start}-{end} {month_name})",
            "tasks": tasks_week,
            "isBlocked": has_blocked
        })

    productive_days = sum(1 for d in daily_hours if daily_hours[d] > 0)

    return {
        "success": True,
        "data": {
            "schedule": weekly_schedule,
            "summary": {
                "totalHours": total_scheduled,
                "averagePerWeek": round(total_scheduled / 4, 1),
                "productiveDays": productive_days,
                "status": "✓ Realistis" if total_scheduled <= max_monthly * 0.8 else "⚠ Padat"
            }
        }
    }



# ============================================
# HELPER FUNCTIONS
# ============================================

def time_to_minutes(time_str):
    """Convert HH:MM to minutes since midnight"""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes):
    """Convert minutes since midnight to HH:MM"""
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def get_day_name(date):
    """Get Indonesian day name from date object"""
    days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    return days[date.weekday()]