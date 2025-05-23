from fe_interface import App
from database import dummy_access_function
import sys

if __name__ == "__main__":
    app = App(dummy_access_function)
    while True:
        try:
            user_input = input("User: ")
            if user_input.lower() in ["quit", "exit", "q"]:
                print("Goodbye!")
                break
            app.query(user_input)
        except Exception:
            user_input = "What do you know about LangGraph?"
            print("User: " + user_input)
            app.query(user_input)
            break
