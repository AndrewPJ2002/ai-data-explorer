from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd
import numpy as np
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

CURRENT_DF = None


class Question(BaseModel):
    question: str


@app.get("/")
def root():
    return {
        "message": "Backend is running!"
    }


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
                "error": "CSV is empty."
            }

        CURRENT_DF = df

        row_count = len(df)
        column_count = len(df.columns)

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

        categorical_columns = (
            df.select_dtypes(
                exclude="number"
            )
            .columns
            .tolist()
        )

        statistics = {}

        for column in numeric_columns:

            col = numeric_df[column].dropna()

            if len(col) == 0:
                continue

            statistics[column] = {

                "count": int(col.count()),

                "mean": round(
                    float(col.mean()), 2
                ),

                "median": round(
                    float(col.median()), 2
                ),

                "std": round(
                    float(col.std()), 2
                ),

                "min": float(col.min()),

                "q1": round(
                    float(col.quantile(.25)), 2
                ),

                "q3": round(
                    float(col.quantile(.75)), 2
                ),

                "max": float(col.max())
            }

        column_info = []

        for column in df.columns:

            column_info.append({

                "name": column,

                "dtype": str(
                    df[column].dtype
                ),

                "missing": int(
                    df[column]
                    .isna()
                    .sum()
                ),

                "unique": int(
                    df[column]
                    .nunique()
                )

            })

        total_cells = row_count * column_count

        missing_cells = int(
            df.isna()
            .sum()
            .sum()
        )

        completeness = round(

            100 *
            (total_cells - missing_cells)
            / total_cells,

            2

        )

        dataset_health = {

            "total_cells": total_cells,

            "missing_cells": missing_cells,

            "completeness": completeness

        }

        correlation = {}

        if len(numeric_columns) > 1:

            correlation = (

                numeric_df
                .corr()
                .round(2)
                .fillna(0)
                .to_dict()

            )

        histograms = {}

        for column in numeric_columns:

            chart_data = []

            col = numeric_df[column].dropna()

            if len(col) == 0:
                continue

            bins = 8

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

            histograms[column] = chart_data

        # ------------------------------------------
        # Default chart (first numeric column)
        # ------------------------------------------

        chart_data = []

        if len(numeric_columns) > 0:

            chart_data = histograms[
                numeric_columns[0]
            ]

        # ------------------------------------------
        # Scatter plot
        # ------------------------------------------

        scatter_data = []

        if len(numeric_columns) >= 2:

            x = numeric_columns[0]
            y = numeric_columns[1]

            sample = (
                df[[x, y]]
                .dropna()
                .head(1000)
            )

            scatter_data = [

                {
                    "x": float(row[x]),
                    "y": float(row[y])
                }

                for _, row in sample.iterrows()

            ]

        # ------------------------------------------
        # AI Suggestions
        # ------------------------------------------

        ai_suggestions = []

        if len(numeric_columns) > 1:

            ai_suggestions.append(
                "Compare relationships using the scatter plot."
            )

        if len(categorical_columns) > 0:

            ai_suggestions.append(
                "Categorical columns detected. Bar charts are recommended."
            )

        if missing_cells > 0:

            ai_suggestions.append(
                "Missing values were detected. Cleaning the dataset may improve analysis."
            )

        if len(df) > 10000:

            ai_suggestions.append(
                "Large dataset detected. Consider filtering before visualization."
            )

        if len(df.columns) > 15:

            ai_suggestions.append(
                "Many columns detected. Focus on the most relevant variables."
            )

        return {

            "row_count": row_count,

            "column_count": column_count,

            "columns": df.columns.tolist(),

            "rows": df.head(10).to_dict(
                orient="records"
            ),

            "missing_values": missing_values,

            "numeric_columns": numeric_columns,

            "categorical_columns": categorical_columns,

            "statistics": statistics,

            "column_info": column_info,

            "dataset_health": dataset_health,

            "correlation": correlation,

            "histograms": histograms,

            "chart_data": chart_data,

            "scatter_data": scatter_data,

            "ai_suggestions": ai_suggestions,

        }

    except Exception as e:

        return {
            "error": str(e)
        }
        # --------------------------------------------------
# AI CHAT
# --------------------------------------------------

@app.post("/ask-ai")
async def ask_ai(question: Question):

    global CURRENT_DF

    if CURRENT_DF is None:
        return {
            "answer": "Please upload a dataset first."
        }

    df = CURRENT_DF

    numeric_df = df.select_dtypes(include="number")

    statistics_text = ""

    for column in numeric_df.columns:

        col = numeric_df[column].dropna()

        statistics_text += f"""

Column: {column}

Mean: {col.mean():.2f}

Median: {col.median():.2f}

Minimum: {col.min()}

Maximum: {col.max()}

Standard Deviation: {col.std():.2f}

"""

    prompt = f"""
You are a senior data scientist helping a user analyze a dataset.

DATASET OVERVIEW

Rows:
{len(df)}

Columns:
{", ".join(df.columns)}

Column Types:
{df.dtypes.to_string()}

Missing Values:
{df.isnull().sum().to_dict()}

Summary Statistics:

{statistics_text}

First Ten Rows:

{df.head(10).to_string()}

=====================================================

The user asked:

{question.question}

=====================================================

Your job:

• Answer using ONLY the information from the dataset.

• If you don't know the answer, explain why.

• Explain your reasoning.

• Mention important trends.

• Mention possible outliers.

• Mention interesting relationships if appropriate.

• Keep answers concise but insightful.

• Use bullet points whenever appropriate.

• Do NOT invent information.

"""

    try:

        response = requests.post(

            "http://localhost:11434/api/generate",

            json={
                "model": "qwen2.5:0.5b",
                "prompt": prompt,
                "stream": False,
            },

            timeout=180,

        )

        result = response.json()

        return {

            "answer": result.get(
                "response",
                "No response returned."
            )

        }

    except Exception as e:

        return {

            "answer":
            f"Error talking to Ollama: {str(e)}"

        }