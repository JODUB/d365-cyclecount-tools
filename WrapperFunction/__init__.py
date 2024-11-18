from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import logging

from WrapperFunction.data import get_data, get_distinct_brands, get_distinct_sites, get_distinct_subdepartments, search_data

import json

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/report", response_class=HTMLResponse)
async def report(request: Request):
    return templates.TemplateResponse(
        request=request, name="index.html"
    )

@app.post("/report")
async def report_post(request: Request):
    form = await request.form()
    subdept = form.get("subdept")
    brand = form.get("brand")
    data = get_data({"subdept": subdept, "brand": brand})
    logging.info(f"Data for subdepartment: {subdept} and brand: {brand} fetched successfully")
    logging.info(f"Data shape: {data.shape}")
    return templates.TemplateResponse(
        request=request,
        name="table.html",
        context={"data": json.loads(data)}
    )

@app.get("/search")
async def search(site: str = Query(None), brand: str = Query(None), subdept: str = Query(None)):
    logging.info(f"Search query received: site={site}, brand={brand}, subdept={subdept}")
    results = search_data(site, brand, subdept)
    logging.info(f"Search results: {results}")
    return {"results": results}

@app.get("/sites")
async def sites():
    logging.info("Fetching distinct sites")
    sites = get_distinct_sites()
    return {"sites": sites}

@app.get("/brands")
async def brands(site: str = Query(None)):
    logging.info(f"Fetching distinct brands for site: {site}")
    brands = get_distinct_brands(site)
    return {"brands": brands}

@app.get("/subdepartments", response_class=JSONResponse)
async def get_subdepartments(site: str = Query(None), brand: str = Query(None)):
    logging.info(f"Fetching distinct subdepartments for site: {site} and brand: {brand}")
    subdepartments = get_distinct_subdepartments(site, brand)
    return {"subdepartments": subdepartments}