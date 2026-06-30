from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd
import io
import math
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Store uploaded dataframe in memory
# --------------------------------------------------

CURRENT_DF = None


class Question(BaseModel):
    question: str


@app.get("/")
def root():
    return {"message": "Backend is running!"}


# --------------------------------------------------
# Upload CSV
# --------------------------------------------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global CURRENT_DF

    try:
        contents = await file.read()

        df = pd.read_csv(
            io.StringIO(
                contents.decode("utf-8")
            )
        )

        if df.empty:
            return {
                "error": "CSV is empty"
            }

        CURRENT_DF = df

        missing_values = (
            df.isnull()
            .sum()
            .to_dict()
        )

        numeric_df = df.select_dtypes(
            include="number"
        )

        numeric_columns = (
            numeric_df.columns.tolist()
        )

        # ----------------------------------
        # Statistics
        # ----------------------------------

        statistics = {}

        for column in numeric_columns:

            col = numeric_df[column].dropna()

            if len(col) == 0:
                continue

            statistics[column] = {
                "mean": round(float(col.mean()), 2),
                "min": float(col.min()),
                "max": float(col.max()),
            }

        # ----------------------------------
        # Histogram
        # ----------------------------------

        chart_data = []

        if len(numeric_columns) > 0:

            first_col = numeric_columns[0]

            col = numeric_df[first_col].dropna()

            if len(col) > 0:

                bins = 5

                min_val = math.floor(col.min())
                max_val = math.ceil(col.max())

                step = max(
                    1,
                    math.ceil(
                        (max_val - min_val) / bins
                    )
                )

                for i in range(bins):

                    start = min_val + i * step
                    end = start + step

                    if i == bins - 1:
                        count = col[
                            (col >= start)
                            &
                            (col <= end)
                        ].shape[0]
                    else:
                        count = col[
                            (col >= start)
                            &
                            (col < end)
                        ].shape[0]

                    chart_data.append(
                        {
                            "name": f"{start}-{end}",
                            "value": int(count),
                        }
                    )

        return {
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": df.columns.tolist(),
            "rows": df.head(5).to_dict(
                orient="records"
            ),
            "missing_values": missing_values,
            "statistics": statistics,
            "numeric_columns": numeric_columns,
            "chart_data": chart_data,
        }

    except Exception as e:
        return {
            "error": str(e)
        }


# --------------------------------------------------
# AI CHAT
# --------------------------------------------------

@app.post("/ask")
async def ask_ai(question: Question):

    global CURRENT_DF

    if CURRENT_DF is None:
        return {
            "answer":
            "Please upload a dataset first."
        }

    df = CURRENT_DF

    numeric_df = df.select_dtypes(
        include="number"
    )

    stats = []

    for col in numeric_df.columns:

        stats.append(
            f"""
Column: {col}
Mean: {numeric_df[col].mean():.2f}
Min: {numeric_df[col].min()}
Max: {numeric_df[col].max()}
"""
        )

    prompt = f"""
You are an expert data analyst.

Dataset Information

Rows:
{len(df)}

Columns:
{", ".join(df.columns)}

Missing Values:
{df.isnull().sum().to_dict()}

Statistics:

{''.join(stats)}

First Five Rows:

{df.head().to_string()}

User Question:

{question.question}

Answer in a concise and helpful way.
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "qwen2.5:3b",
                "prompt": prompt,
                "stream": False,
            },
            timeout=120,
        )

        result = response.json()

        return {
            "answer": result["response"]
        }

    except Exception as e:

        return {
            "answer":
            f"Error talking to Ollama: {str(e)}"
        }