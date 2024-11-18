import polars as pl
import logging

def open_data_file(file_path: str) -> pl.DataFrame:
    df = pl.read_parquet(file_path)
    print("Columns in DataFrame:", df.columns)
    return df

def get_data(filters: dict = None) -> pl.DataFrame:
    logging.info(f"Fetching data with filters: {filters}")
    data = open_data_file("ProductCategoryBrands.parquet")
    if filters:
        if 'site' in filters:
            data = data.filter(pl.col('SiteID') == filters['site'])
        if 'subdept' in filters:
            data = data.filter(pl.col('SubDepartmentName') == filters['subdept'])
        if 'brand' in filters:
            data = data.filter(pl.col('BrandName') == filters['brand'])
        logging.info(f"Results: {data}")
    return data

def filter_data(site: str, subdept: str, brand: str) -> dict:
    logging.info(f"Filtering data with site: {site}, subdepartment: {subdept}, and brand: {brand}")
    filters = {'site': site, 'subdept': subdept, 'brand': brand}
    data = get_data(filters)
    print(data.shape)
    return data.write_json()

def get_distinct_sites() -> list:
    logging.info("Fetching distinct sites")
    data = get_data() # Get all data
    sites = data.select("SiteID").unique().to_series().to_list() # Get unique sites
    sites.sort()  # Sort the sites alphabetically
    return sites

def get_distinct_brands(site: str = None) -> list:
    logging.info(f"Fetching distinct brands for site: {site}")
    data = get_data({"site": site} if site else None) # Get data for the site
    brands = data.select("BrandName").unique().to_series().to_list() # Get unique brands
    brands.sort()  # Sort the brands alphabetically
    return brands

def get_distinct_subdepartments(site: str = None, brand: str = None) -> list:
    logging.info(f"Fetching distinct subdepartments for site: {site} and brand: {brand}")
    filters = {}
    if site:
        filters['site'] = site
    if brand:
        filters['brand'] = brand
    data = get_data(filters)
    subdepartments = data.select("SubDepartmentName").unique().to_series().to_list()
    subdepartments = [subdept.upper() for subdept in subdepartments]  # Convert to upper case
    subdepartments.sort()  # Sort the subdepartments alphabetically
    return subdepartments

def search_data(site: str = None, brand: str = None, subdept: str = None) -> list:
    logging.info(f"Searching data with site: {site}, brand: {brand}, and subdepartment: {subdept}")
    filters = {}
    if site:
        filters['site'] = site
    if brand:
        filters['brand'] = brand
    if subdept:
        filters['subdept'] = subdept
    data = get_data(filters)
    return data.to_dicts()