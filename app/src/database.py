from langchain_core.tools import tool
from langchain_community.graphs import Neo4jGraph
import os
from dotenv import load_dotenv

load_dotenv()

kg = Neo4jGraph(
    url=os.getenv("NEO4J_URI"),
    username=os.getenv("NEO4J_USERNAME"),
    password=os.getenv("NEO4J_PASSWORD"),
    database=os.getenv("NEO4J_DATABASE"),
)


@tool(
    description="""get list of products, call it if the user wants to know the products"""
)
def get_list_of_products() -> list[str]:
    """Returns all product names."""
    query = "MATCH (p:Product) RETURN p.name"
    product_names = \
        [p['p.name'] for p in kg.query(query)]

    return product_names


@tool(
    description="""returns the vulnerability of a product
        """
)
def get_product_vulnerability(input: str) -> str:
    """Returns the vulnerability of a product."""
    query = f"""
        match (:Product {{name:'{input}'}})-[:HAS_VERSION]->(pv:ProductVersion)-[:HAS_VULNERABILITY]->(v:Vulnerability) return pv.full_name as product_version, v.description as description
    """
    vulnerabilities = kg.query(query)

    vulnerabilities_md = f"Vulnabilities of {input} by product version\n\n"
    current_version = ""
    vulnability_idx = 0

    for vulnability in vulnerabilities:
        if current_version != vulnability['product_version']:
            current_version = vulnability['product_version']
            vulnability_idx = 0

            vulnerabilities_md += f"## product version: {current_version}\n\n"

        vulnerabilities_md += f"### {vulnability_idx} \n\n{vulnability['description']}\n\n"
        vulnability_idx += 1

    return vulnerabilities_md
