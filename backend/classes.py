class User:
    
    def __init__(self, email, password, name, _id=None, programs=None, roles=None, active_cohorts=None, legacy_cohorts=None, is_active=None):
        if _id is not None:
            self._id = _id
        self.email = email
        self.password = password
        self.name = name
        if programs:
            self.programs = programs
        else:
            self.programs = {
                "data_science": False,
                "full_stack": False,
                "cyber_security": False,
                "vibe_coding": False,
                "vibe_intense": False,
            }
        if roles:
            self.roles = roles
        else:
            self.roles = {
                "is_admin": False,
                "is_teacher": False,
                "is_teacher_assistant": False,
                "is_global_mentor": False,
                "is_mentor": False,
            }
        if active_cohorts:
            self.active_cohorts = active_cohorts
        else:
            self.active_cohorts = []
        if legacy_cohorts:
            self.legacy_cohorts = legacy_cohorts
        else:
            self.legacy_cohorts = []
        if is_active:
            self.is_active = is_active
        else:
            self.is_active = False

    def __repr__(self):
        return f"User({self.name}, {self.email})"

    def add_cohort(self, cohort):
        if cohort not in self.active_cohorts:
            self.active_cohorts.append(cohort)
        else:
            raise ValueError("Cohort already exists in active cohorts")
        
    def remove_cohort(self, cohort):
        if cohort in self.active_cohorts:
            self.active_cohorts.remove(cohort)
            self.legacy_cohorts.append(cohort)
        else:
            raise ValueError("Cohort not found in active cohorts")
        
    def toggle_program(self, program):
        if program in self.programs:
            self.programs[program] = not self.programs[program]
        else:
            raise ValueError("Program not recognized")
        
    def add_legacy_cohort(self, cohort):
        if cohort not in self.legacy_cohorts:
            self.legacy_cohorts.append(cohort)
        else:
            raise ValueError("Cohort already exists in legacy cohorts")
        
    def toggle_role(self, role):
        if role in self.roles:
            self.roles[role] = not self.roles[role]
        else:
            raise ValueError("Role not recognized")
        
    def toggle_active(self):
        self.is_active = not self.is_active

    @classmethod
    def unserialize(cls, data):
        return cls(
            email=data.get("email"),
            password=data.get("password"),
            name=data.get("name"),
            _id=str(data.get("_id")),
            programs=data.get("programs", {}),
            roles=data.get("roles", {}),
            active_cohorts=data.get("active_cohorts", []),
            legacy_cohorts=data.get("legacy_cohorts", []),
            is_active=data.get("is_active", False)
        )

    def serialize(self):
        data = {
            "email": self.email,
            "name": self.name,
            "programs": self.programs,
            "roles": self.roles,
            "active_cohorts": self.active_cohorts,
            "legacy_cohorts": self.legacy_cohorts,
            "is_active": self.is_active
        }
        if hasattr(self, "_id"):
            data["_id"] = str(self._id)
        return data

class Student:
    def __init__(self, name, email, active_cohorts=None, legacy_cohorts=None, personal_sessions=None, _id=None):
        self._id = _id if _id is not None else None
        self.name = name
        self.email = email
        if legacy_cohorts:
            self.legacy_cohorts = legacy_cohorts
        else:
            self.legacy_cohorts = []
        if active_cohorts:
            self.active_cohorts = active_cohorts
        else:
            self.active_cohorts = []
        if personal_sessions:
            self.personal_sessions = personal_sessions
        else:
            self.personal_sessions = []
        self.is_active = True

    def __repr__(self):
        return f"Student({self.name}, {self.email})"
    
    def add_cohort(self, cohort):
        if cohort not in self.active_cohorts:
            self.active_cohorts.append(cohort)
        else:
            raise ValueError("Cohort already exists in active cohorts")
        
    def remove_cohort(self, cohort):
        if cohort in self.active_cohorts:
            self.active_cohorts.remove(cohort)
            self.legacy_cohorts.append(cohort)
        else:
            raise ValueError("Cohort not found in active cohorts")
        
    def add_session(self, session):
        if session not in self.personal_sessions:
            self.personal_sessions.append(session)
        else:
            raise ValueError("Session already exists in personal sessions")

    def remove_session(self, session):
        if session in self.personal_sessions:
            self.personal_sessions.remove(session)
        else:
            raise ValueError("Session not found in personal sessions") 
        
    @classmethod
    def unserialize(cls, data):
        return cls(
            name=data.get("name"),
            email=data.get("email"),
            active_cohorts=data.get("active_cohorts", []),
            legacy_cohorts=data.get("legacy_cohorts", []),
            personal_sessions=data.get("personal_sessions", []),
            _id=str(data.get("_id"))
        )
    
    def serialize(self):
        data = {
            "name": self.name,
            "email": self.email,
            "active_cohorts": self.active_cohorts,
            "legacy_cohorts": self.legacy_cohorts,
            "personal_sessions": self.personal_sessions,
            "is_active": self.is_active
        }
        if self._id is not None:
            data["_id"] = str(self._id)
        return data

class Session:
    def __init__(self, type_of, date, added_by, project, student, work_description=None, _id=None):
        self._id = str(_id) if _id is not None else None
        self.type_of = type_of
        self.date = date
        self.added_by = added_by
        self.project = project
        self.work_description = work_description if work_description else ""
        self.student = student

    def __repr__(self):
        return f"Session({self.type_of}, {self.date}, {self.student.name})"
    
    def update_description(self, new_description):
        self.work_description = new_description

    def update_project(self, new_project):
        self.project = new_project

    def update_date(self, new_date):
        self.date = new_date

    def update_type_of(self, new_type):
        self.type_of = new_type

    @classmethod
    def unserialize(cls, data):
        return cls(
            type_of=data.get("type_of"),
            date=data.get("date"),
            added_by=data.get("added_by"),
            project=data.get("project"),
            student=data.get("student"),
            work_description=data.get("work_description", ""),
            _id=str(data.get("_id")) if data.get("_id") is not None else None
        )

    def serialize(self):
        data = {
            "type_of": self.type_of,
            "date": self.date,
            "added_by": self.added_by,
            "project": self.project,
            "student": self.student,
            "work_description": self.work_description
        }
        if hasattr(self, "_id") and self._id is not None:
            data["_id"] = str(self._id)
        return data
        

class Day:
    def __init__(self, date, _id=None, global_sessions=None, private_sessions=None):
        if _id:
            self._id = _id if _id is not None else None
        self.date = date
        if global_sessions:
            self.global_sessions = global_sessions
        else:
            global_sessions = []
        if private_sessions:
            self.private_sessions = private_sessions
        else:
            self.private_sessions = []

    def __repr__(self):
        return f"Day({self.date}, Global Sessions: {len(self.global_sessions)}, Private Sessions: {len(self.private_sessions)})"

    def add_session(self, session):
        if session.type_of == "global":
            self.global_sessions.append(session)
        elif session.type_of == "private":
            self.private_sessions.append(session)
        else:
            raise ValueError("Session type must be 'global' or 'private'")
    
    def remove_session(self, session):
        if session in self.global_sessions:
            self.global_sessions.remove(session)
        elif session in self.private_sessions:
            self.private_sessions.remove(session)
        else:
            raise ValueError("Session not found in this day")
        
    @classmethod
    def unserialize(cls, data):
        return cls(
            date=data.get("date"),
            _id=data.get("_id"),
            global_sessions=[Session.unserialize(session) for session in data.get("global_sessions", [])],
            private_sessions=[Session.unserialize(session) for session in data.get("private_sessions", [])]
        )
        
    def serialize(self):
        data = {
            "date": self.date,
            "global_sessions": [session.serialize() for session in self.global_sessions],
            "private_sessions": [session.serialize() for session in self.private_sessions]
        }
        if self._id is not None:
            data["_id"] = str(self._id)
        return data
        
class Timesheet:
    def __init__(self, user, times=None, verified=False, notes=None, _id=None):
        user = user
        if _id:
            self._id = _id if _id is not None else None
        if times:
            self.times = times
        else:
            self.times = []
        if verified is not None:
            self.verified = verified
        else:
            self.verified = False
        if notes:
            self.notes = notes
        else:
            self.notes = ""

    def __repr__(self):
        return f"Timesheet(User: {self.user.name}, Verified: {self.verified})"
    
    def add_time(self, time_entry):
        if isinstance(time_entry, dict):
            self.times.append(time_entry)
        else:
            raise ValueError("Time entry must be a dictionary")
        
    def remove_time(self, time_entry):
        if time_entry in self.times:
            self.times.remove(time_entry)
        else:
            raise ValueError("Time entry not found in timesheet")
        
    def verify(self):
        self.verified = True

    def unverify(self):
        self.verified = False

    def add_notes(self, notes):
        if isinstance(notes, str):
            self.notes = notes
        else:
            raise ValueError("Note must be a string")
        
    def remove_notes(self):
        self.notes = ""

    def get_times_between_dates(self, start_date, end_date):
        filtered_global_times = []
        filtered_teacher_times = []
        filtered_assistant_times = []
        gross_hours = 0
        global_hours = 0
        teacher_hours = 0
        assistant_hours = 0
        for time_entry in self.times:
            if start_date <= time_entry['date'] <= end_date:
                if time_entry['type'] == 'global':
                    filtered_global_times.append(time_entry)
                    global_hours += time_entry['hours']
                elif time_entry['type'] == 'teacher':
                    filtered_teacher_times.append(time_entry)
                    teacher_hours += time_entry['hours']
                else: 
                    filtered_assistant_times.append(time_entry)
                    assistant_hours += time_entry['hours']
                gross_hours += time_entry['hours']

        return {
            "user": self.user,
            "verified": self.verified,
            "notes": self.notes,
            "global_times": filtered_global_times,
            "teacher_times": filtered_teacher_times,
            "assistant_times": filtered_assistant_times,
            "total_hours": {
                "gross_hours": gross_hours,
                "global_hours": global_hours,
                "teacher_hours": teacher_hours,
                "assistant_hours": assistant_hours
            },
            "timesheet_id": self._id
        }
    
    @classmethod
    def unserialize(cls, data):
        return cls(
            user=User.unserialize(data.get("user", {})),
            times=data.get("times", []),
            verified=data.get("verified", False),
            notes=data.get("notes", ""),
            _id=data.get("_id")
        )
    
    def serialize(self):
        data = {
            "user": self.user.serialize(),
            "times": self.times,
            "verified": self.verified,
            "notes": self.notes
        }
        if self._id is not None:
            data["_id"] = str(self._id)
        return data

class Pay_Period:
    def __init__(self, start, end, is_finished=False, _id=None, total_hours=None, filtered_sheets=None, submitted_date=None):
        if _id:
            self._id = _id if _id is not None else None
        self.start = start
        self.end = end
        self.is_finished = is_finished
        if total_hours:
            self.total_hours = total_hours
        else:
            self.total_hours = {
                "gross_hours": 0,
                "global_hours": 0,
                "teacher_hours": 0,
                "assistant_hours": 0
            }
        if filtered_sheets:
            self.filtered_sheets = filtered_sheets
        else:
            self.filtered_sheets = []
        if submitted_date:
            self.submitted_date = submitted_date
        else:
            self.submitted_date = None

    def __repr__(self):
        return f"Pay_Period({self.start} to {self.end}, Finished?: {self.is_finished})"
    
    def add_new_filtered_sheet(self, filtered_sheet, timesheet_id):
        if not any(sheet.timesheet_id == timesheet_id for sheet in self.filtered_sheets):
            self.filtered_sheets.append(filtered_sheet)
            self.total_hours["gross_hours"] += filtered_sheet.total_hours["gross_hours"]
            self.total_hours["global_hours"] += filtered_sheet.total_hours["global_hours"]
            self.total_hours["teacher_hours"] += filtered_sheet.total_hours["teacher_hours"]
            self.total_hours["assistant_hours"] += filtered_sheet.total_hours["assistant_hours"]
        else:
            raise ValueError("Filtered sheet for this user already exists in pay period")

    def remove_filtered_sheet(self, timesheet_id):
        for sheet in self.filtered_sheets:
            if sheet.timesheet_id == timesheet_id:
                self.total_hours["gross_hours"] -= sheet.total_hours["gross_hours"]
                self.total_hours["global_hours"] -= sheet.total_hours["global_hours"]
                self.total_hours["teacher_hours"] -= sheet.total_hours["teacher_hours"]
                self.total_hours["assistant_hours"] -= sheet.total_hours["assistant_hours"]
                self.filtered_sheets.remove(sheet)
                return
        raise ValueError("Filtered sheet for this user not found in pay period")
        
    def set_finished(self, is_finished, date):
        self.is_finished = is_finished
        if is_finished:
            self.submitted_date = date
        else:
            self.submitted_date = None

    def get_filtered_sheet(self, timesheet_id):
        for sheet in self.filtered_sheets:
            if sheet.timesheet_id == timesheet_id:
                return sheet
            raise ValueError("Filtered sheet for this user not found in pay period")
        
    def edit_start_end_dates(self, new_start, new_end):
        if new_start < new_end:
            self.start = new_start
            self.end = new_end
        else:
            raise ValueError("Start date must be before end date")
        
    @classmethod
    def unserialize(cls, data):
        return cls(
            start=data.get("start"),
            end=data.get("end"),
            is_finished=data.get("is_finished", False),
            _id=data.get("_id"),
            total_hours=data.get("total_hours", {"gross_hours": 0, "global_hours": 0, "teacher_hours": 0, "assistant_hours": 0}),
            filtered_sheets=[Timesheet.unserialize(sheet) for sheet in data.get("filtered_sheets", [])],
            submitted_date=data.get("submitted_date")
        )

    def serialize(self):
        data = {
            "start": self.start,
            "end": self.end,
            "is_finished": self.is_finished,
            "total_hours": self.total_hours,
            "filtered_sheets": self.filtered_sheets,
            "submitted_date": self.submitted_date
        }
        if self._id is not None:
            data["_id"] = str(self._id)
        return data