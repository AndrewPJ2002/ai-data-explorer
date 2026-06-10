from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Backend is running!"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file.file.seek(0)

        df = pd.read_csv(file.file)

        missing_values = df.isnull().sum().to_dict()

        numeric_df = df.select_dtypes(include="number")

        statistics = {}

        for column in numeric_df.columns:
            statistics[column] = {
                "mean": round(float(numeric_df[column].mean()), 2),
                "min": float(numeric_df[column].min()),
                "max": float(numeric_df[column].max()),
            }

        return {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "rows": df.head(5).to_dict(orient="records"),
            "missing_values": missing_values,
            "statistics": statistics,
        }

    except Exception as e:
        return {"error": str(e)}