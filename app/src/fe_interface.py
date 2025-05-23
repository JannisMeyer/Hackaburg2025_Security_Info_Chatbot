from typing import Annotated

from langchain.chat_models.base import BaseChatModel
from pydantic.type_adapter import P
from typing_extensions import TypedDict

# from typing import Function
from uuid import uuid4
import os

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import create_react_agent


class State(TypedDict):
    messages: Annotated[list, add_messages]


class App:
    @staticmethod
    def initialize_graph(search_tool):
        graph_builder = StateGraph(State)

        model = init_chat_model()

        def chat(state: State):
            return {"messages": [model.invoke(state["messages"])]}

        graph_builder.add_node("chat", chat)

        graph_builder.add_edge(START, "chat")

        return graph_builder.compile()

    def __init__(self, db_fun) -> None:
        self.graph = create_react_agent(
            model="google_genai:gemini-2.0-flash",
            tools=[db_fun],
            prompt="You are a model that can monitor tool usage, please call all the tools once and explain the results",
        )

    def query(self, input: str) -> str:
        output = ""
        for event in self.graph.stream(
            {"messages": [{"role": "user", "content": input}]}
        ):
            for value in event.values():
                output += value["messages"][-1].content
        return output
