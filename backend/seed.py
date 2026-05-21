import os
import random
import datetime
from sqlalchemy import create_engine
from database import Base, engine, SessionLocal
from models import Admission, Resource, Anomaly, Recommendation, AuditLog, Patient

def seed_database():
    print("Initializing Database Seeding for MediOps AI...")
    
    # Resolve SQLite database path to ensure we can recreate it clean
    db_file = "mediops.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print(f"Removed existing database '{db_file}' to start fresh.")
        except Exception as e:
            print(f"Warning: Could not remove database file: {e}")

    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

    db = SessionLocal()
    try:
        # 1. Seed 90 Days of Historical Admissions
        print("Generating 90 days of historical admissions...")
        departments = ["Emergency", "ICU", "Cardiology", "Pediatrics", "General Medicine"]
        
        # Base daily admissions average per department
        dept_baselines = {
            "Emergency": 45,
            "ICU": 8,
            "Cardiology": 15,
            "Pediatrics": 25,
            "General Medicine": 60
        }
        
        start_date = datetime.date.today() - datetime.timedelta(days=90)
        admissions = []
        
        for day_offset in range(91):
            current_date = start_date + datetime.timedelta(days=day_offset)
            date_str = current_date.strftime("%Y-%m-%d")
            
            # Simple day of week multiplier (higher admissions on weekends for ER, lower for General Med)
            day_of_week = current_date.weekday()
            is_weekend = day_of_week >= 5
            
            for dept in departments:
                base = dept_baselines[dept]
                
                # Seasonality and randomness
                if dept == "Emergency":
                    multiplier = 1.3 if is_weekend else 1.0
                    # Add random spikes
                    spike = random.randint(-8, 12)
                elif dept == "ICU":
                    multiplier = 1.1 if is_weekend else 0.95
                    spike = random.randint(-2, 3)
                elif dept == "General Medicine":
                    multiplier = 0.8 if is_weekend else 1.1
                    spike = random.randint(-10, 10)
                else:
                    multiplier = 0.9 if is_weekend else 1.0
                    spike = random.randint(-5, 5)
                
                count = int(base * multiplier) + spike
                count = max(0, count)  # no negative admissions
                
                admissions.append(Admission(date=date_str, department=dept, count=count))
                
        db.add_all(admissions)
        print(f"Seeded {len(admissions)} admission records.")

        # 2. Seed Initial Resources
        print("Seeding initial operational resources...")
        resources = [
            Resource(id="RES-01", name="ICU Beds", category="Beds", total=40, allocated=38, unit="Beds"),
            Resource(id="RES-02", name="Ventilators", category="Equipment", total=30, allocated=22, unit="Units"),
            Resource(id="RES-03", name="Oxygen Supply", category="Consumables", total=1000, allocated=650, unit="Liters"),
            Resource(id="RES-04", name="Epinephrine Vials", category="Consumables", total=500, allocated=440, unit="Vials"),
            Resource(id="RES-05", name="Emergency Staff (Active)", category="Staff", total=24, allocated=22, unit="Nurses/MDs"),
            Resource(id="RES-06", name="General Wards Beds", category="Beds", total=200, allocated=154, unit="Beds")
        ]
        db.add_all(resources)
        print(f"Seeded {len(resources)} core resource rows.")

        # 3. Seed Initial Active Anomalies
        print("Seeding baseline operational anomalies...")
        now = datetime.datetime.now()
        anomalies = [
            Anomaly(
                id="ANM-204", 
                type="Billing Pattern", 
                severity="Medium", 
                message="Dual submission flag for patient insurance ref P-10903", 
                timestamp=now - datetime.timedelta(hours=1, minutes=46),
                status="Active", 
                impact_score=42
            ),
            Anomaly(
                id="ANM-205", 
                type="ICU Overload", 
                severity="Critical", 
                message="ICU capacity reached 95% limit. Expected surge in ER transfers.", 
                timestamp=now - datetime.timedelta(hours=1),
                status="Active", 
                impact_score=92
            ),
            Anomaly(
                id="ANM-206", 
                type="Unusual Wait Spike", 
                severity="High", 
                message="Emergency Department wait times spiked to 65 mins average.", 
                timestamp=now - datetime.timedelta(minutes=45),
                status="Active", 
                impact_score=78
            )
        ]
        db.add_all(anomalies)
        print(f"Seeded {len(anomalies)} active anomalies.")

        # 4. Seed Initial Recommendations (Explainable AI)
        print("Seeding AI recommendations (decision intelligence)...")
        recommendations = [
            Recommendation(
                id="REC-401",
                title="Deploy Additional Staff to ED",
                description="Deploy 2 additional nurses and 1 physician to the Emergency Department from General Wards.",
                priority="Critical",
                confidence=94.0,
                factors="ED Wait times > 60 mins,3 incoming ambulances,Staff utilization in General Wards is at 62%",
                operational_impact="Reduces ER average wait times by an estimated 18 minutes; rebalances ward staffing ratios to 82%.",
                action_label="Reallocate Staff",
                status="Pending"
            ),
            Recommendation(
                id="REC-402",
                title="Initiate ICU Bed Cleanup Protocols",
                description="Trigger rapid discharge review for 3 patients in General ICU who meet the step-down criteria.",
                priority="High",
                confidence=89.0,
                factors="ICU occupancy at 95%,2 critical cases in ER waiting for ICU beds,Average length of stay of candidate patients is +12% vs. norm",
                operational_impact="Frees up 2 ICU beds within 3 hours, mitigating ICU congestion risk.",
                action_label="Initiate Discharges",
                status="Pending"
            ),
            Recommendation(
                id="REC-403",
                title="Restock Epinephrine Stocks in Pharmacy",
                description="Approve emergency purchase order of Epinephrine vials to counter inventory run-down.",
                priority="Medium",
                confidence=91.0,
                factors="Epinephrine stock level at 12%,Daily burn rate increased by 28%,Supplier delivery lead time is 24 hours",
                operational_impact="Prevents supply stockout within the next 18 hours.",
                action_label="Auto-Order Supply",
                status="Pending"
            )
        ]
        db.add_all(recommendations)
        print(f"Seeded {len(recommendations)} decision intelligence recommendations.")

        # 5. Seed Initial Audit Logs
        print("Seeding initial compliance audit trail...")
        audit_logs = [
            AuditLog(
                user_role="Operations Manager", 
                action="Inventory Checked", 
                details="Oxygen tanks verified at 65% capacity.",
                timestamp=now - datetime.timedelta(hours=2)
            ),
            AuditLog(
                user_role="Operations Manager", 
                action="Anomaly Logged", 
                details="ICU occupancy crossed threshold limit of 90%.",
                timestamp=now - datetime.timedelta(hours=1, minutes=10)
            )
        ]
        db.add_all(audit_logs)
        print(f"Seeded {len(audit_logs)} compliance audit log entries.")

        # 6. Seed Active Patients
        print("Seeding active patient roster...")
        patients = [
            Patient(id="P-101", name="David Miller", age=52, gender="Male", department="ICU", severity="Critical", waitTime=0, status="Admitted", bedNumber="ICU-B3", admittedAt="10:15 AM"),
            Patient(id="P-102", name="Sarah Connor", age=41, gender="Female", department="Emergency", severity="Severe", waitTime=18, status="Awaiting Doctor", bedNumber=None, admittedAt="1:45 PM"),
            Patient(id="P-103", name="Robert Chen", age=67, gender="Male", department="Cardiology", severity="Critical", waitTime=5, status="Admitted", bedNumber="CARD-12", admittedAt="11:30 AM"),
            Patient(id="P-104", name="Elena Rostova", age=29, gender="Female", department="Emergency", severity="Moderate", waitTime=42, status="In Triage", bedNumber=None, admittedAt="2:10 PM"),
            Patient(id="P-105", name="James Wilson", age=73, gender="Male", department="General Medicine", severity="Mild", waitTime=75, status="Awaiting Doctor", bedNumber=None, admittedAt="12:05 PM"),
            Patient(id="P-106", name="Michael Vance", age=58, gender="Male", department="ICU", severity="Critical", waitTime=0, status="Admitted", bedNumber="ICU-B1", admittedAt="08:20 AM"),
            Patient(id="P-107", name="Lisa Alvarez", age=34, gender="Female", department="Pediatrics", severity="Moderate", waitTime=25, status="Awaiting Doctor", bedNumber=None, admittedAt="2:30 PM"),
            Patient(id="P-108", name="Arthur Shelby", age=46, gender="Male", department="Emergency", severity="Severe", waitTime=12, status="In Triage", bedNumber=None, admittedAt="2:22 PM"),
        ]
        db.add_all(patients)
        print(f"Seeded {len(patients)} active patient records.")

        db.commit()
        print("Database commit completed. Seeding successful!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
