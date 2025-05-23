from langchain_core.tools import tool

products = {
    "bike": "you can get ran over",
    "car": "can run you over",
    "computer": "you stink",
    "window": "neighbors will see you",
}


@tool(
    description="""get list of products, call it if the user wants to know the products"""
)
def get_list_of_products() -> list[str]:
    return ["bike", "car", "shoe", "computer", "window"]


@tool(
    description="""returns the vulnerability of a product
        after calling the function summarize the outputs"""
)
def get_product_vulnerability(input: str) -> str:
    a = products.get(input)
    return a if a is not None else "product vuln not available"
