from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import math

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
        # -------------------------
        # READ CSV SAFELY
        # -------------------------
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        if df.empty:
            return {"error": "CSV is empty"}

        # -------------------------
        # BASIC INFO
        # -------------------------
        missing_values = df.isnull().sum().to_dict()

        numeric_df = df.select_dtypes(include="number")
        numeric_columns = numeric_df.columns.tolist()

        # -------------------------
        # STATISTICS
        # -------------------------
        statistics = {}

        for column in numeric_columns:
            col_data = numeric_df[column].dropna()

            if len(col_data) == 0:
                continue

            statistics[column] = {
                "mean": round(float(col_data.mean()), 2),
                "min": float(col_data.min()),
                "max": float(col_data.max()),
            }

        # -------------------------
        # CLEAN HISTOGRAM CHART DATA
        # -------------------------
        chart_data = []

        if len(numeric_columns) > 0:
            first_col = numeric_columns[0]
            col_data = numeric_df[first_col].dropna()

            if len(col_data) > 0:
                bins = 5

                min_val = math.floor(col_data.min())
                max_val = math.ceil(col_data.max())

                step = max(1, (max_val - min_val) // bins)

                for i in range(bins):
                    start = min_val + i * step
                    end = start + step

                    count = col_data[
                        (col_data >= start) & (col_data < end)
                    ].shape[0]

                    chart_data.append({
                        "name": f"{start}-{end}",
                        "value": int(count)
                    })

        # -------------------------
        # RESPONSE
        # -------------------------
        return {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "rows": df.head(5).to_dict(orient="records"),
            "missing_values": missing_values,
            "statistics": statistics,
            "numeric_columns": numeric_columns,
            "chart_data": chart_data,
        }

    except Exception as e:
        return {"error": str(e)}