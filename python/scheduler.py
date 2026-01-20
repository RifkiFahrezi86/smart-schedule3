# =============================================
# SMART SCHEDULING - SCHEDULER ALGORITHMS


from datetime import datetime, timedelta

# ============================================
# DAILY SCHEDULER 
# ============================================

def run_daily(payload):
    """
    Daily scheduler 
    """
    config = payload["config"]
    activities = payload["activities"]
    
    # Convert time strings to minutes
    start = time_to_minutes(config["startTime"])
    end = time_to_minutes(config["endTime"])
    personal_start = time_to_minutes(config["personalStart"])
    personal_end = time_to_minutes(config["personalEnd"])
    break_time = config["breakTime"]
    max_productive = config["maxProductive"]
    
    # Validate basic constraints
    total_duration = sum(act["duration"] for act in activities)
    available_time = end - start - (personal_end - personal_start)
    
    # Calculate breaks needed (between activities, not after last)
    breaks_needed = max(0, len(activities) - 1) * break_time
    total_needed = total_duration + breaks_needed
    
    # Pre-validation
    if total_duration > max_productive:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total durasi aktivitas ({total_duration} menit) melebihi Max Productive Time ({max_productive} menit)"}
            ],
            "suggestions": [
                f"Kurangi total durasi menjadi ≤ {max_productive} menit",
                "Hapus beberapa aktivitas yang tidak prioritas",
                f"Atau tingkatkan Max Productive menjadi ≥ {total_duration} menit"
            ]
        }
    
    if total_needed > available_time:
        return {
            "success": False,
            "errors": [
                {"type": "Waktu", "message": f"Total waktu yang dibutuhkan ({total_needed} menit) melebihi waktu tersedia ({available_time} menit)"}
            ],
            "suggestions": [
                f"Perpanjang waktu aktif (End Time → {minutes_to_time(start + total_needed + (personal_end - personal_start))})",
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
        
        # Add time-specific context
        if time_slot < personal_start:
            return reasons[priority] + " (sebelum personal time)"
        elif time_slot >= personal_end:
            return reasons[priority] + " (setelah personal time)"
        return reasons[priority]
    
    # Simple greedy approach
    current_time = start
    total_productive = 0
    
    for i, activity in enumerate(activities):
        duration = activity["duration"]
        
        # ✅ ADD PERSONAL TIME BLOCK if we reach it
        if not personal_time_added and current_time < personal_end and current_time + duration > personal_start:
            # Need to insert personal time
            if current_time < personal_start:
                # Add break before personal time if there were activities before
                if len(schedule) > 0 and schedule[-1]["activity"] != "Break Time ☕":
                    schedule.append({
                        "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + break_time)}",
                        "activity": "Break Time ☕",
                        "duration": f"{break_time} menit",
                        "reason": "Istirahat sebelum personal time"
                    })
                    current_time += break_time
                
                # Add Personal Time block
                schedule.append({
                    "time": f"{minutes_to_time(personal_start)} - {minutes_to_time(personal_end)}",
                    "activity": "Personal Time 🍽️",
                    "duration": f"{personal_end - personal_start} menit",
                    "reason": "Waktu untuk makan, istirahat, atau kegiatan pribadi"
                })
                current_time = personal_end
                personal_time_added = True
        
        # Check if we can still fit this activity
        if current_time + duration > end:
            return {
                "success": False,
                "errors": [
                    {"type": "Waktu", "message": "Tidak cukup waktu untuk semua aktivitas setelah personal time"}
                ],
                "suggestions": [
                    "Perpanjang End Time",
                    "Kurangi Personal Time",
                    "Kurangi durasi beberapa aktivitas"
                ]
            }
        
        # Schedule activity
        schedule.append({
            "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + duration)}",
            "activity": activity["name"],
            "duration": f"{duration} menit",
            "reason": get_reason(activity, current_time)
        })
        
        total_productive += duration
        current_time += duration
        
        # Add break ONLY between activities (not after last one)
        if i < len(activities) - 1:
            schedule.append({
                "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + break_time)}",
                "activity": "Break Time ☕",
                "duration": f"{break_time} menit",
                "reason": "Istirahat untuk menjaga fokus dan produktivitas"
            })
            current_time += break_time
    
    # Calculate final summary
    total_break = max(0, len(activities) - 1) * break_time
    personal_duration = personal_end - personal_start
    actual_end = current_time
    
    return {
        "success": True,
        "data": {
            "schedule": schedule,
            "summary": {
                "totalProductive": total_productive,
                "breakTime": total_break,
                "personalTime": personal_duration,
                "endTime": minutes_to_time(actual_end)
            }
        }
    }


# ============================================
# WEEKLY SCHEDULER
# ============================================

def run_weekly(payload):
    """
    Fixed weekly scheduler with proper deadline handling
    """
    config = payload["config"]
    tasks = payload["tasks"]
    
    max_weekly = config["maxHoursPerWeek"]
    active_days = config["activeDays"]
    weeks = config["weeks"]
    start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")
    
    # Pre-validation
    total_hours = sum(task["duration"] for task in tasks)
    max_capacity = max_weekly * weeks
    
    if total_hours > max_capacity:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total jam tugas ({total_hours} jam) melebihi kapasitas total ({max_capacity} jam = {max_weekly} jam/minggu × {weeks} minggu)"}
            ],
            "suggestions": [
                f"Perpanjang periode menjadi {(total_hours // max_weekly) + 1} minggu",
                f"Tingkatkan max jam/minggu menjadi ≥ {total_hours // weeks} jam",
                "Kurangi estimasi durasi beberapa tugas",
                "Hapus tugas yang tidak prioritas"
            ]
        }
    
    # Check deadlines
    for task in tasks:
        deadline_date = datetime.strptime(task["deadline"], "%Y-%m-%d")
        if deadline_date < start_date:
            return {
                "success": False,
                "errors": [
                    {"type": "Deadline", "message": f"Tugas '{task['name']}' memiliki deadline ({task['deadline']}) sebelum tanggal mulai ({config['startDate']})"}
                ],
                "suggestions": [
                    "Mundurkan deadline tugas",
                    f"Atau mulai penjadwalan lebih awal (sebelum {config['startDate']})"
                ]
            }
    
    # Sort by deadline (Greedy: earliest first)
    tasks_sorted = sorted(tasks, key=lambda x: datetime.strptime(x["deadline"], "%Y-%m-%d"))
    
    # Distribute tasks across weeks
    weekly_schedule = {}
    weekly_hours = {}
    
    for week_num in range(weeks):
        weekly_schedule[week_num] = []
        weekly_hours[week_num] = 0
    
    day_names_map = {
        0: "Senin", 1: "Selasa", 2: "Rabu", 3: "Kamis",
        4: "Jumat", 5: "Sabtu", 6: "Minggu"
    }
    
    # Assign tasks to days
    for task in tasks_sorted:
        deadline_date = datetime.strptime(task["deadline"], "%Y-%m-%d")
        days_until_deadline = (deadline_date - start_date).days
        
        # Find suitable week and day
        assigned = False
        
        # Try to assign to weeks before deadline
        max_week = min(weeks - 1, days_until_deadline // 7)
        
        for week_num in range(max_week + 1):
            if weekly_hours[week_num] + task["duration"] <= max_weekly:
                # Find an active day in this week
                week_start = start_date + timedelta(weeks=week_num)
                
                for day_offset in range(7):
                    current_date = week_start + timedelta(days=day_offset)
                    
                    if current_date > deadline_date:
                        break
                    
                    day_name = day_names_map[current_date.weekday()]
                    
                    if day_name in active_days:
                        # Assign task to this day
                        weekly_schedule[week_num].append({
                            "day": f"{day_name}, {current_date.strftime('%d %b')}",
                            "task": task["name"],
                            "hours": f"{task['duration']} jam",
                            "time": "14:00 - 17:00"
                        })
                        
                        weekly_hours[week_num] += task["duration"]
                        assigned = True
                        break
                
                if assigned:
                    break
        
        if not assigned:
            return {
                "success": False,
                "errors": [
                    {"type": "Penjadwalan", "message": f"Tidak dapat menjadwalkan tugas '{task['name']}' sebelum deadline"}
                ],
                "suggestions": [
                    "Tambah hari aktif belajar",
                    "Tingkatkan max jam per minggu",
                    "Perpanjang periode penjadwalan",
                    "Mundurkan deadline beberapa tugas"
                ]
            }
    
    # Format result
    result_schedule = []
    total_hours = 0
    
    for week_num in sorted(weekly_schedule.keys()):
        week_start = start_date + timedelta(weeks=week_num)
        week_end = week_start + timedelta(days=6)
        
        week_hours = weekly_hours[week_num]
        total_hours += week_hours
        
        result_schedule.append({
            "week": f"Minggu {week_num + 1} ({week_start.strftime('%d')}-{week_end.strftime('%d %b')})",
            "tasks": weekly_schedule[week_num],
            "totalHours": week_hours
        })
    
    return {
        "success": True,
        "data": {
            "schedule": result_schedule,
            "summary": {
                "totalHours": total_hours,
                "averagePerWeek": round(total_hours / weeks, 1),
                "tasksCompleted": f"{len(tasks)}/{len(tasks)}",
                "status": "✓ Seimbang" if total_hours <= max_capacity * 0.8 else "⚠ Padat"
            }
        }
    }


# ============================================
# MONTHLY SCHEDULER
# ============================================

def run_monthly(payload):
    """
    Fixed monthly scheduler with proper date handling
    """
    config = payload["config"]
    tasks = payload["tasks"]
    
    max_monthly = config["maxHoursPerMonth"]
    blocked_dates = set(config.get("blockedDates", []))
    start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")
    
    # Pre-validation
    total_hours = sum(task["duration"] for task in tasks)
    
    if total_hours > max_monthly:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total jam proyek ({total_hours} jam) melebihi kapasitas bulanan ({max_monthly} jam)"}
            ],
            "suggestions": [
                f"Tingkatkan max jam/bulan menjadi ≥ {total_hours} jam",
                "Kurangi estimasi durasi beberapa proyek",
                "Perpanjang penjadwalan ke 2 bulan",
                "Hapus proyek yang tidak prioritas"
            ]
        }
    
    # Count available days
    days_in_month = 31
    available_days = days_in_month - len(blocked_dates)
    
    if available_days < len(tasks):
        return {
            "success": False,
            "errors": [
                {"type": "Tanggal", "message": f"Hari produktif ({available_days}) lebih sedikit dari jumlah proyek ({len(tasks)})"}
            ],
            "suggestions": [
                "Kurangi tanggal terblokir",
                "Gabungkan beberapa proyek kecil",
                f"Perpanjang periode atau kurangi {len(blocked_dates) - (days_in_month - len(tasks))} tanggal terblokir"
            ]
        }
    
    # Sort by deadline (Greedy: earliest first)
    tasks_sorted = sorted(tasks, key=lambda x: x["deadline"])
    
    # Distribute tasks across month
    month_schedule = {}
    total_scheduled = 0
    
    for task in tasks_sorted:
        deadline = task["deadline"]
        
        # Find suitable day before deadline
        assigned = False
        
        for day in range(1, deadline + 1):
            if day not in blocked_dates:
                if day not in month_schedule:
                    month_schedule[day] = []
                
                # Check if we still have capacity
                if total_scheduled + task["duration"] <= max_monthly:
                    month_schedule[day].append({
                        "task": task["name"],
                        "hours": task["duration"]
                    })
                    total_scheduled += task["duration"]
                    assigned = True
                    break
        
        if not assigned:
            return {
                "success": False,
                "errors": [
                    {"type": "Penjadwalan", "message": f"Tidak dapat menjadwalkan '{task['name']}' sebelum deadline (tgl {deadline})"}
                ],
                "suggestions": [
                    "Mundurkan deadline proyek",
                    "Kurangi tanggal terblokir",
                    "Pecah proyek besar menjadi bagian lebih kecil"
                ]
            }
    
    # Format by weeks
    weekly_schedule = []
    month_name = start_date.strftime("%b")
    
    for week_num in range(4):
        week_start = week_num * 7 + 1
        week_end = min(week_start + 6, 31)
        
        week_tasks = []
        has_blocked = False
        
        for day in range(week_start, week_end + 1):
            if day in blocked_dates:
                has_blocked = True
            
            if day in month_schedule:
                for task_info in month_schedule[day]:
                    week_tasks.append({
                        "date": f"{day} {month_name}",
                        "task": task_info["task"],
                        "hours": f"{task_info['hours']} jam"
                    })
        
        weekly_schedule.append({
            "weekLabel": f"Minggu {week_num + 1} ({week_start}-{week_end} {month_name})",
            "tasks": week_tasks,
            "isBlocked": has_blocked
        })
    
    productive_days = len(month_schedule)
    
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