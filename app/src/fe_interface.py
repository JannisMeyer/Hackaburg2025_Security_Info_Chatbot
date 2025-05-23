from typing import Annotated

from typing_extensions import TypedDict
from langgraph.checkpoint.memory import InMemorySaver


from langgraph.graph.message import add_messages
from langgraph.prebuilt import create_react_agent


class State(TypedDict):
    messages: Annotated[list, add_messages]


class App:
    def __init__(self, db_fun) -> None:
        self.checkpointer = InMemorySaver()
        self.graph = create_react_agent(
            model="google_genai:gemini-2.0-flash",
            tools=db_fun,
            checkpointer=self.checkpointer,
            prompt="call the appropriate function",
        )

    def query(self, input: str, id: str) -> str:
        config = {"configurable": {"thread_id": id}}
        return (
            self.graph.invoke(
                {"messages": [{"role": "user", "content": input}]}, config=config
            )
            .get("messages")[-1]
            .content
        )
