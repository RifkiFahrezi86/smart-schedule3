# =============================================
# SMART SCHEDULING - SCHEDULER ALGORITHMS
# Greedy + Backtracking Implementation
# =============================================

from datetime import datetime, timedelta

# ============================================
# DAILY SCHEDULER
# ============================================

def run_daily(payload):
    config = payload["config"]
    activities = payload["activities"]
    
    # Convert time strings to minutes
    start = time_to_minutes(config["startTime"])
    end = time_to_minutes(config["endTime"])
    personal_start = time_to_minutes(config["personalStart"])
    personal_end = time_to_minutes(config["personalEnd"])
    break_time = config["breakTime"]
    max_productive = config["maxProductive"]
    
    # Sort by duration (Greedy: longest first)
    activities.sort(key=lambda x: x["duration"], reverse=True)
    
    schedule = []
    total_productive = 0
    
    def is_valid(start_time, duration):
        end_time = start_time + duration
        # Check personal time conflict
        if start_time < personal_end and end_time > personal_start:
            return False
        # Check end of day
        if end_time > end:
            return False
        # Check max productive
        if total_productive + duration > max_productive:
            return False
        return True
    
    def get_reason(activity, time_start):
        reasons = {
            "tinggi": "Prioritas tinggi, dikerjakan saat fresh",
            "sedang": "Durasi menengah, sebelum break time",
            "rendah": "Aktivitas ringan, setelah personal time"
        }
        return reasons.get(activity["priority"], "Aktivitas terjadwal")
    
    def backtrack(index, current_time, productive):
        nonlocal total_productive
        
        if index == len(activities):
            return True
        
        activity = activities[index]
        duration = activity["duration"]
        
        # Try to schedule at current time
        if is_valid(current_time, duration):
            total_productive = productive + duration
            
            schedule.append({
                "time": f"{minutes_to_time(current_time)} - {minutes_to_time(current_time + duration)}",
                "activity": activity["name"],
                "duration": f"{duration} menit",
                "reason": get_reason(activity, current_time)
            })
            
            # Add break time
            next_time = current_time + duration + break_time
            schedule.append({
                "time": f"{minutes_to_time(current_time + duration)} - {minutes_to_time(next_time)}",
                "activity": "Break Time",
                "duration": f"{break_time} menit",
                "reason": "Istirahat setelah aktivitas"
            })
            
            if backtrack(index + 1, next_time, total_productive):
                return True
            
            # Backtrack
            schedule.pop()
            schedule.pop()
            total_productive = productive
        
        return False
    
    # Run backtracking
    success = backtrack(0, start, 0)
    
    if not success:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total durasi aktivitas melebihi Productive Time max ({max_productive} menit)"},
                {"type": "Waktu", "message": "Personal Time bentrok dengan jadwal aktivitas"}
            ],
            "suggestions": [
                "Kurangi durasi beberapa aktivitas",
                f"Perpanjang waktu aktif (misal: {config['startTime']} - 17:00)",
                "Tingkatkan Productive Time max",
                "Sesuaikan waktu Personal Time"
            ]
        }
    
    # Calculate summary
    total_break = sum(1 for item in schedule if item["activity"] == "Break Time") * break_time
    personal_duration = personal_end - personal_start
    
    return {
        "success": True,
        "data": {
            "schedule": schedule,
            "summary": {
                "totalProductive": total_productive,
                "breakTime": total_break,
                "personalTime": personal_duration,
                "endTime": schedule[-1]["time"].split(" - ")[1] if schedule else config["endTime"]
            }
        }
    }

# ============================================
# WEEKLY SCHEDULER
# ============================================

def run_weekly(payload):
    config = payload["config"]
    tasks = payload["tasks"]
    
    max_weekly = config["maxHoursPerWeek"]
    active_days = config["activeDays"]
    weeks = config["weeks"]
    
    # Sort by deadline (Greedy: earliest first)
    tasks.sort(key=lambda x: x["deadline"])
    
    schedule = {}
    weekly_hours = {}
    
    def backtrack(index):
        if index == len(tasks):
            return True
        
        task = tasks[index]
        deadline_date = datetime.strptime(task["deadline"], "%Y-%m-%d")
        start_date = datetime.strptime(config["startDate"], "%Y-%m-%d")
        days_until_deadline = (deadline_date - start_date).days
        
        for day in range(days_until_deadline + 1):
            day_name = get_day_name(start_date + timedelta(days=day))
            
            # Skip if not active day
            if day_name not in active_days:
                continue
            
            week_num = day // 7
            weekly_hours.setdefault(week_num, 0)
            
            if weekly_hours[week_num] + task["duration"] <= max_weekly:
                date_str = (start_date + timedelta(days=day)).strftime("%d %b")
                key = f"{day_name}, {date_str}"
                
                schedule.setdefault(week_num, []).append({
                    "day": key,
                    "task": task["name"],
                    "hours": f"{task['duration']} jam",
                    "time": "14:00 - 17:00"  # Default time slot
                })
                
                weekly_hours[week_num] += task["duration"]
                
                if backtrack(index + 1):
                    return True
                
                # Backtrack
                schedule[week_num].remove(schedule[week_num][-1])
                weekly_hours[week_num] -= task["duration"]
        
        return False
    
    success = backtrack(0)
    
    if not success:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total jam tugas melebihi kapasitas {weeks} minggu"},
                {"type": "Deadline", "message": "Beberapa tugas tidak bisa selesai sebelum deadline"}
            ],
            "suggestions": [
                f"Perpanjang periode menjadi {weeks + 1} minggu",
                "Tingkatkan max jam/minggu",
                "Sesuaikan deadline beberapa tugas",
                "Kurangi estimasi jam pada beberapa tugas"
            ]
        }
    
    # Format result
    weekly_schedule = []
    total_hours = 0
    
    for week_num in sorted(schedule.keys()):
        week_hours = sum(int(task["hours"].split()[0]) for task in schedule[week_num])
        total_hours += week_hours
        
        start_date = datetime.strptime(config["startDate"], "%Y-%m-%d") + timedelta(weeks=week_num)
        end_date = start_date + timedelta(days=6)
        
        weekly_schedule.append({
            "week": f"Minggu {week_num + 1} ({start_date.strftime('%d')}-{end_date.strftime('%d %b')})",
            "tasks": schedule[week_num],
            "totalHours": week_hours
        })
    
    return {
        "success": True,
        "data": {
            "schedule": weekly_schedule,
            "summary": {
                "totalHours": total_hours,
                "averagePerWeek": total_hours / weeks,
                "tasksCompleted": f"{len(tasks)}/{len(tasks)}",
                "status": "✓ Seimbang"
            }
        }
    }

# ============================================
# MONTHLY SCHEDULER
# ============================================

def run_monthly(payload):
    config = payload["config"]
    tasks = payload["tasks"]
    
    max_monthly = config["maxHoursPerMonth"]
    blocked_dates = set(int(d) for d in config["blockedDates"])
    
    # Sort by deadline (Greedy: earliest first)
    tasks.sort(key=lambda x: int(x["deadline"]))
    
    schedule = {}
    total_hours = 0
    
    def backtrack(index):
        nonlocal total_hours
        
        if index == len(tasks):
            return True
        
        task = tasks[index]
        deadline = int(task["deadline"])
        
        for day in range(1, deadline + 1):
            if day in blocked_dates:
                continue
            
            if total_hours + task["duration"] <= max_monthly:
                schedule.setdefault(day, []).append(task["name"])
                total_hours += task["duration"]
                
                if backtrack(index + 1):
                    return True
                
                # Backtrack
                schedule[day].remove(task["name"])
                total_hours -= task["duration"]
        
        return False
    
    success = backtrack(0)
    
    if not success:
        return {
            "success": False,
            "errors": [
                {"type": "Kapasitas", "message": f"Total jam ({total_hours} jam) melebihi batas max ({max_monthly} jam/bulan)"},
                {"type": "Tanggal Terblokir", "message": "Terlalu banyak hari libur, mengurangi hari produktif"}
            ],
            "suggestions": [
                "Tingkatkan max jam/bulan",
                "Kurangi tanggal terblokir",
                "Perpanjang deadline beberapa proyek",
                "Pecah proyek besar menjadi fase lebih kecil"
            ]
        }
    
    # Format result by weeks
    monthly_schedule = []
    for week_num in range(4):
        week_start = week_num * 7 + 1
        week_end = min(week_start + 6, 31)
        
        week_tasks = []
        for day in range(week_start, week_end + 1):
            if day in schedule:
                for task_name in schedule[day]:
                    week_tasks.append({
                        "date": f"{day} Jan",
                        "task": task_name,
                        "hours": "4 jam"  # Default
                    })
        
        if week_tasks:
            monthly_schedule.append({
                "weekLabel": f"Minggu {week_num + 1} ({week_start}-{week_end} Jan)",
                "tasks": week_tasks,
                "isBlocked": any(d in blocked_dates for d in range(week_start, week_end + 1))
            })
    
    return {
        "success": True,
        "data": {
            "schedule": monthly_schedule,
            "summary": {
                "totalHours": total_hours,
                "averagePerWeek": total_hours / 4,
                "productiveDays": len(schedule),
                "status": "✓ Realistis"
            }
        }
    }

# ============================================
# HELPER FUNCTIONS
# ============================================

def time_to_minutes(time_str):
    """Convert HH:MM to minutes"""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m

def minutes_to_time(minutes):
    """Convert minutes to HH:MM"""
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def get_day_name(date):
    """Get Indonesian day name"""
    days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    return days[date.weekday()]