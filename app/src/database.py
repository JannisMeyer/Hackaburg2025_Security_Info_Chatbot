from langchain_core.tools import tool

products = ["something"] * 10


@tool
def dummy_access_function(_: str) -> str:
    """Access the vector storage with input as input"""
    return "this is dummy output"
