from typing import List, Dict, Any
import numpy as np

class AnomalyDetector:
    """
    Statistically identifies outliers and operational alerts inside hospital databases.
    Combines rule-based capacity filters and statistical Z-score triggers.
    """

    @staticmethod
    def calculate_z_score_anomalies(data: List[float], threshold: float = 2.0) -> List[int]:
        """
        Flag indexes where value exceeds Z-score threshold (e.g. > 2.0 standard deviations).
        Useful for detecting sudden wait time surges or unusual patient counts.
        """
        if len(data) < 5:
            return []
            
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return []
            
        anomalies = []
        for idx, val in enumerate(data):
            z_score = abs(val - mean) / std
            if z_score > threshold:
                anomalies.append(idx)
        return anomalies

    @classmethod
    def scan_operations(cls, resources: List[Dict[str, Any]], wait_times: List[float]) -> List[Dict[str, Any]]:
        """
        Scan active resources and wait metrics, returning a list of flagged anomaly events.
        """
        alerts = []
        
        # 1. Scan for ICU Overload
        icu_beds = next((r for r in resources if r["name"] == "ICU Beds"), None)
        if icu_beds:
            occupancy = (icu_beds["allocated"] / icu_beds["total"]) * 100
            if occupancy >= 95:
                alerts.append({
                    "id": "ANM-SYS-ICU",
                    "type": "ICU Overload",
                    "severity": "Critical",
                    "message": f"ICU bed utilization at {occupancy:.1f}% capacity. Emergency step-down protocols advised.",
                    "impact_score": 92
                })

        # 2. Scan for Wait Time Spikes using statistical Z-score
        if wait_times:
            avg_wait = wait_times[-1]
            if len(wait_times) >= 5:
                flagged_indices = cls.calculate_z_score_anomalies(wait_times, threshold=1.5)
                if len(wait_times) - 1 in flagged_indices and avg_wait > 50:
                    alerts.append({
                        "id": "ANM-SYS-WAIT",
                        "type": "Unusual Wait Spike",
                        "severity": "High",
                        "message": f"Emergency Department average triage wait spiked abnormally to {avg_wait:.1f} minutes.",
                        "impact_score": 78
                    })
            elif avg_wait > 60:
                # Rule fallback
                alerts.append({
                    "id": "ANM-SYS-WAIT-R",
                    "type": "Unusual Wait Spike",
                    "severity": "High",
                    "message": f"Emergency wait time is excessively high ({avg_wait} minutes).",
                    "impact_score": 70
                })

        # 3. Scan for Staffing deficits
        staff = next((r for r in resources if r["category"] == "Staff"), None)
        if staff:
            utilization = (staff["allocated"] / staff["total"]) * 100
            if utilization >= 90:
                alerts.append({
                    "id": "ANM-SYS-STAFF",
                    "type": "Staffing Deficit",
                    "severity": "High",
                    "message": f"Clinical staff utilization at {utilization:.1f}%. High risk of triage delays.",
                    "impact_score": 85
                })

        return alerts
