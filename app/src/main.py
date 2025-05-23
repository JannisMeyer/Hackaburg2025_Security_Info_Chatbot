from fe_interface import App
from database import get_product_vulnerability, get_list_of_products
import sys

if __name__ == "__main__":
    app = App([get_product_vulnerability, get_list_of_products])
    id = "skibidi"
    while True:
        try:
            user_input = input("User: ")
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break
            print(app.query(user_input, id))
        except Exception:
            user_input = "What do you know about LangGraph?"
            print("User: " + user_input)
            app.query(user_input, id)
            break
