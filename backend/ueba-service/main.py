from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI(title="ArgusChain UEBA Service")

class AccessEvent(BaseModel):
    userId: str
    assetId: str
    action: str
    timestamp: int
    ipAddress: str
    result: str

# Mock feature store: counts requests per user
user_request_counts = {}

@app.post("/score")
def score_event(event: AccessEvent):
    score = 0
    reason = None
    
    # 1. Honeypot check (Immediate High Risk)
    if event.assetId.startswith("decoy_"):
        return {
            "anomaly_score": 100,
            "reason": "HONEYPOT_TRIGGERED",
            "tier": "high-risk"
        }
        
    # 2. Volume Anomaly check (Mock Isolation Forest behavior)
    current_time = time.time()
    
    if event.userId not in user_request_counts:
        user_request_counts[event.userId] = []
        
    # Add current timestamp
    user_request_counts[event.userId].append(current_time)
    
    # Filter to last 60 seconds
    recent_requests = [t for t in user_request_counts[event.userId] if current_time - t <= 60]
    user_request_counts[event.userId] = recent_requests
    
    if len(recent_requests) > 20: # Arbitrary threshold for demo
        score = 85
        reason = "ANOMALY_VOLUME_HIGH"
        tier = "watch"
    else:
        tier = "normal"
        
    return {
        "anomaly_score": score,
        "reason": reason,
        "tier": tier
    }
