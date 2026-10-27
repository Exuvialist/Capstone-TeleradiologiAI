import time
import random
from typing import Dict, Any

from app.models.enums import DiseaseType, PredictionResult
from app.models.examination import Examination

def run_ai_prediction(examination: Examination) -> Dict[str, Any]:
    """
    Menjalankan proses prediksi AI untuk citra medis pemeriksaan.
    Mengembalikan data yang sesuai dengan skema tabel AI_PREDICTIONS:
    - model_version (varchar)
    - predicted_result (positive | negative)
    - probability (numeric)
    - inference_ms (int)
    """
    start_time = time.time()
    disease = examination.disease_type

    # Simulasi latensi komputasi model AI (< 1 detik)
    time.sleep(random.uniform(0.3, 0.7))

    # Tentukan model_version dan hasil berdasarkan jenis penyakit
    if disease == DiseaseType.bone_cancer:
        version = "efficientnet-b0-v1.0"
        is_pos = random.random() > 0.4
        prob = round(random.uniform(0.85, 0.97) if is_pos else random.uniform(0.88, 0.99), 4)
    elif disease == DiseaseType.pneumonia:
        version = "resnet50-v1.0"
        is_pos = random.random() > 0.35
        prob = round(random.uniform(0.83, 0.96) if is_pos else random.uniform(0.86, 0.98), 4)
    else:  # brain_tumor
        version = "custom-cnn-v1.0"
        is_pos = random.random() > 0.45
        prob = round(random.uniform(0.84, 0.95) if is_pos else random.uniform(0.87, 0.98), 4)

    result = PredictionResult.positive if is_pos else PredictionResult.negative
    duration_ms = int((time.time() - start_time) * 1000)

    return {
        "model_version": version,
        "predicted_result": result,
        "probability": prob,
        "inference_ms": duration_ms
    }
