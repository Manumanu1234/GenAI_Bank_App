from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict
import json
from langgraph.graph import MessagesState
from typing import Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from typing_extensions import Annotated, TypedDict
import uvicorn
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver
from IPython.display import Image, display
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents import AgentType
from langchain.memory import ConversationBufferMemory
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_together import ChatTogether
from pydantic import Field,BaseModel
api_key=""
mainllm = ChatGroq(
    api_key=api_key,
    model="gemma2-9b-it",
)
memmory=ConversationBufferMemory(memory_key="history")
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can specify specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods like POST, GET, etc.
    allow_headers=["*"],  # Allows all headers
)

graph = None
thread = None

class FMstate(BaseModel):
    name_senter: str = Field(
        default="You",
        description="The name of the sender."
    )
    reciever: str = Field(
        default="",
        description="The name of the receiver. Ensure the first letter is capitalized."
    )
    number: str = Field(
        default="None",
        description="Provide the number if available; otherwise, explicitly input 'None'."
    )
    amount: str = Field(
        default="None",
        description="Provide the amount if available only int value; otherwise, explicitly input 'None'."
    )
    availablebalance:str =Field(
        default="None",
        description="Provide the balance amount;  otherwise, explicitly input 'None'."
    )

final_llm=mainllm.with_structured_output(FMstate)
def function1(state):
    last_message=state['messages'][-1].content
    result=final_llm.invoke(last_message)
    
    if len(result.reciever)==0:
        return "SenderNotFound"
    
    if result.number=='None':
        return {'finalout': result, 'messages': result.reciever,'name':'None','number':'None'}  
    else:
        return {'finalout': result, 'messages': result.reciever,'name':'None','number':result.number}
class FormatState(MessagesState):
    finalout:FMstate
    number:str
    name:str
    persondetails:list
def function2(state):
    print(state['messages'][-1].content)
memory=MemorySaver()
workflow=StateGraph(FormatState) 


import psycopg2

def detailsfetching(search_key, search_value):
    try:
        connection = psycopg2.connect(
            dbname="bankapp",
            user="postgres",
            password="manu",
            host="localhost",
            port=5432
        )
        cursor = connection.cursor()
        query = f"SELECT * FROM users WHERE {search_key} = %s"
        cursor.execute(query, (search_value,))
        result = cursor.fetchall() 
        for row in result:
            print(row)    
        return result
    except psycopg2.Error as e:
        print("Database error:", e)
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        

import psycopg2
def databasecheck(state):
    connection = psycopg2.connect(
        dbname="bankapp",
        user="postgres",
        password="manu",
        host="localhost",
        port=5432
    )
    
    name_to_check=state['messages'][-1].content
    print(name_to_check)
    cursor = connection.cursor()
    query = "SELECT COUNT(*) FROM users WHERE name = %s;"
    cursor.execute(query, (name_to_check,))
    count = cursor.fetchone()[0]
    cursor.close()
    connection.close()
    if count > 0:
        return {'name':name_to_check,'messages':'personexist'}
    else:
        return {'messages':'personnotexist'}

def function4(state):
    print("--------------------user intruption-------------------")
    feedback=interrupt("please provide yes or no")
    return {'messages':feedback}

def function3(state):
    
    if state['name'] !='None':
        data=detailsfetching('name',state['name'])
        return {'persondetails':data[0]}
    elif state['number'] !='None':
        data=detailsfetching('phoneno',state['number'])
        return {'persondetails':data[0]}
    else:
        print("both have value not filled")
        return {'messages':'notmention'}
def router1(state):
    if state['messages'][-1].content=='personexist':
        return 'personexist'
    else:
        return 'personnotexist'
def router2(state):
    if state['messages'][-1].content=='yes':
        return 'yes'
    else:
        return 'no'
def router3(state):
    lastmessage=state['messages'][-1]
    if lastmessage.tool_calls:
        return "yes"
    else:
        return "no"
    
def NeedMobile(state):
    mobilenumber=''
    if state['number'] =='None':
        mobilenumber=interrupt("Contact not found please make Sure the Number")
    else:
        mobilenumber=state['number']
        
    if len(mobilenumber)<10:
        print("mobile number is not valid")
    else:
        connection = psycopg2.connect(
            dbname="bankapp",
            user="postgres",
            password="manu",
            host="localhost",
            port=5432
        )
        
        number_to_check=state['messages'][-1].content
        
        
        cursor = connection.cursor()
        query = "SELECT COUNT(*) FROM users WHERE phoneno = %s;"
        cursor.execute(query, (mobilenumber,))
        count = cursor.fetchone()[0]
        cursor.close()
        connection.close()
        if count > 0:
            return {'number':mobilenumber,'messages':'personexist'}
        else:
            return {'messages':'personnotexist'}
def amountavilability(state):
    if state['finalout'].amount!='None':
        print("amount  recived")
    else:
        print("__________amount inturrpt________________")
        amount=interrupt("Please make sure the amount")
        state['finalout'].amount=amount
        return {'messages':amount}
    
def amount_correction(state):
    name='Grace Lee'
    data=detailsfetching('name',name)
    amount=data[0]
    amount_to_send=state['finalout'].amount
    print("amount_current",amount[5])
    print("amount_to_send",amount_to_send)
    current=int(amount[5])
    send=int(amount_to_send)
    if send<current:
        return{'messages':'yes'}
    else:
        return {'messages':'no'}
from langchain_community.agent_toolkits import create_sql_agent
from langchain.agents import AgentType
from langchain_groq import ChatGroq
from langchain.tools import BaseTool, StructuredTool, tool
import psycopg2
amount=0
@tool
def tool_calling_fun1(sender, receiver, amount,currentbalanceofsender,currentbalanceofreciver):
    """
    Used to transfer money from one person to another person.
    Fetch current Balances of both sender and reciver
    Args:
        sender (str): The name of the sender.
        receiver (str): The name of the receiver.
        amount (float): The amount to transfer.
        currentbalanceofsender (float):The current balance amount of sender fetch from databaase
        currentbalanceofreciver (float):The current balance amount of reciever sender fetch from databaase
        
    Returns:
        dict: A dictionary with a message about the transfer status.
    """
     
    connection = psycopg2.connect(
        dbname="bankapp",
        user="postgres",
        password="manu",
        host="localhost",
        port=5432
    )

    try:
        cursor = connection.cursor()
        new_sender_balance = currentbalanceofsender - amount
        new_receiver_balance = currentbalanceofreciver + amount

        update_sender_query = "UPDATE users SET amount = %s WHERE name = %s;"
        update_receiver_query = "UPDATE users SET amount = %s WHERE name = %s;"
        
        cursor.execute(update_sender_query, (new_sender_balance, sender))
        cursor.execute(update_receiver_query, (new_receiver_balance, receiver))
        connection.commit()
        return {
            'messages': f"Successfully transferred {amount} from '{sender}' to '{receiver}'.",
        }
    except Exception as e:
        connection.rollback()
        return {'messages': f"An error occurred during the transfer: {e}"}
    finally:
        cursor.close()
        connection.close()
       
       
@tool
def tool_calling_fun2(sender, receiver):
    """
    Usefull to get  the current balance of both the sender and the receiver.

    Args:
        sender (str): The name of the sender.
        receiver (str): The name of the receiver.

    Returns:
        dict: A dictionary containing the current balance of the sender and the receiver.
    """
    
    connection = psycopg2.connect(
        dbname="bankapp",
        user="postgres",
        password="manu",
        host="localhost",
        port=5432
    )

    try:
        cursor = connection.cursor()

        fetch_sender_query = "SELECT amount FROM users WHERE name = %s;"
        fetch_receiver_query = "SELECT amount FROM users WHERE name = %s;"

        cursor.execute(fetch_sender_query, (sender,))
        sender_balance = cursor.fetchone()

        cursor.execute(fetch_receiver_query, (receiver,))
        receiver_balance = cursor.fetchone()

        if sender_balance is None or receiver_balance is None:
            return {'messages': f"One or both users not found: Sender: {sender}, Receiver: {receiver}"}

        return {
            'messages': {
                'sender_balance': sender_balance[0],
                'receiver_balance': receiver_balance[0],
            },
        }
    except Exception as e:
        return {'messages': f"An error occurred while fetching balances: {e}"}
    finally:
        cursor.close()
        connection.close()
mainllm=ChatGroq(api_key=api_key,
            model_name="gemma2-9b-it",temperature=0)   
from langgraph.prebuilt import ToolNode
tools=[tool_calling_fun1,tool_calling_fun2]
toolnode=ToolNode(tools)
llm=mainllm.bind_tools(tools)


def choiceFun(state:MessagesState):
    print(state['messages'])
    result=llm.invoke(state['messages'])
    return {'messages':[result]}
from langchain_core.messages import HumanMessage
def queryFormat(state):
    reciver_name=state['persondetails'][1]
    sender_name='Grace Lee'
    amount=state['finalout'].amount
    print('------printing----')
    print(sender_name,amount,reciver_name)
    query=f"send money to {reciver_name} with amount {amount} from {sender_name}"
    prompt=HumanMessage(content=query)
    return {'messages':[prompt]}




def buildgraph():
    workflow.add_node("query_process",function1)
    workflow.add_node('database_check',databasecheck)
    workflow.add_node('sample',function3)
    workflow.add_node('needmobile',NeedMobile)
    workflow.add_node('amount_detail',amountavilability)
    workflow.add_node('amount_correct_or_not',amount_correction)
    workflow.add_node("agent",choiceFun)
    workflow.add_node('tools',toolnode)
    workflow.add_edge('query_process','database_check')
    workflow.add_edge(START, "query_process")
    workflow.add_node("user__confirmation",function4)
    workflow.add_node("queryformat",queryFormat)
    workflow.add_conditional_edges(
        "database_check",
        router1,
        {'personexist':'sample',
        'personnotexist':'needmobile'}
    )
    workflow.add_conditional_edges(
        "needmobile",
        router1,
        {'personexist':'sample',
        'personnotexist':END}
        
    )
    workflow.add_conditional_edges(
        "user__confirmation",
        router2,
        {
            'yes':'amount_detail',
            'no':END
        }
        
    )
    workflow.add_conditional_edges(
        "amount_correct_or_not",
        router2,
        {
            'yes':'queryformat',
            'no':END
        }
    )
    workflow.add_edge("queryformat","agent")
    workflow.add_conditional_edges(
        "agent",
        router3,
        {
            'yes':'tools',
            'no':END
        }
        
    )
    workflow.add_edge("sample","user__confirmation")
    workflow.add_edge("amount_detail","amount_correct_or_not")
    workflow.add_edge("tools","agent")
    graph=workflow.compile(checkpointer=memory)
    return graph

@app.on_event("startup")
async def startup_event():
    global graph, thread
    print("Initializing graph...")
    graph = buildgraph()
    thread = {"configurable": {"thread_id": "some_id"}}
    print("Thread initialized:", thread)
import random
class Values(BaseModel):
    data:list
@app.post("/start")
async def start(data: Values):
    global thread
    if graph is not None:
        number=random.randint(1, 10)
        thread = {"configurable": {"thread_id": number}}
        initial_input = data.data
        print(initial_input)
        result=graph.invoke({'messages': [data.data[0]]},config=thread)
        print("haiiiii")
        print(result)
        intrrupted_name=graph.get_state(config=thread).tasks[0].name
        if intrrupted_name == "user__confirmation":
            print("entering---------")
            return {"message": result["persondetails"],"intrrupted_name":intrrupted_name}
        elif intrrupted_name == "needmobile":
            return {"message": "No Contact in this provided name Can you describe with the person Name","intrrupted_name":intrrupted_name}
        elif intrrupted_name == "amount_detail":
            return {"message":"You Don't Mention The amount to send can You mention the Amount","intrrupted_name":intrrupted_name}
        else:
            return {"message": intrrupted_name}
    else:
        return {"message": "Graph not initialized"}
from langchain.output_parsers import PydanticOutputParser
class Formating(BaseModel):
    amount: str = Field(..., description="The Sending Amount from sender")
    current_balance: str = Field(..., description="The Current available balance of the sender")
    final_result:str=Field(...,description="Final Result is sucess or fail")
from langchain.prompts import PromptTemplate
def final_making(result):
    api_key=""
    chat = ChatTogether(
        api_key=api_key,
        model="google/gemma-2-27b-it",
    )
    
    parser=PydanticOutputParser(pydantic_object=Formating)
    format_instruction=parser.get_format_instructions()
    template: str = (
        "You are an Optimistic identifier. Your job is to identify the current sender amount and the amount that has gone from the sender.\n"
        "Chat_History: {chat_history}\n"
        "## Instruction: {format_instruction}"
    )
    final_prompt = PromptTemplate(
    template=template,
    input_variables=['chat_history'],
    partial_variables={"format_instruction": format_instruction}
    )
    chain =final_prompt|chat|parser
    result=chain.invoke({"chat_history":result})
    new_details={
        "amount":result.amount,
        "current_balance":result.current_balance,
        "final_result":result.final_result
    }
    return new_details

import psycopg2
from datetime import date  

def insert_transaction(sen_name, rec_name, amount):
    try:
     
        connection = psycopg2.connect(
            dbname="userdetails",
            user="postgres",
            password="manu",
            host="localhost",
            port=5432
        )
        cursor = connection.cursor()
        

        transaction_date = date.today()


        insert_query = """
        INSERT INTO transaction (sen_name, rec_name, amount, date) 
        VALUES (%s, %s, %s, %s)
        """
        
 
        cursor.execute(insert_query, (sen_name, rec_name, amount, transaction_date))
        

        connection.commit()
        
        return {'message': "Transaction inserted successfully"}
    
    except psycopg2.Error as e:
        return {'message': f"Database error: {e}"}
    
    except Exception as e:
        return {'message': f"An unexpected error occurred: {e}"}
    
    finally:

        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'connection' in locals() and connection:
            connection.close()




@app.post("/confirm")
async def confirm(data: Values):
    global thread
    if graph is not None and thread is not None:
        print("Resuming to step 3...")
        result = graph.invoke(Command(resume=data.data[0]), config=thread)
        task=graph.get_state(config=thread).tasks
        if len(task)>0:
            intrrupted_name=graph.get_state(config=thread).tasks[0].name
            if intrrupted_name == "user__confirmation":
                print("entering---------")
                return {"message": result["persondetails"],"intrrupted_name":intrrupted_name}
            elif intrrupted_name == "needmobile":
                return {"message": "No Contact in this provided name Can you describe with the person Name","intrrupted_name":intrrupted_name}
            elif intrrupted_name == "amount_detail":
                return {"message":"You Don't Mention The amount to send can You mention the Amount","intrrupted_name":intrrupted_name}
            else:
                return {"message": intrrupted_name}
          
        final_=final_making(result)
        final_["receiver_details"] = result.get("persondetails", "Unknown receiver")
        final_["sender_details"] = [7, "Grace Lee", "159 Willow Way, GA", 8444556677, "TD Bank", 23915]
        
        if not final_.get("receiver_details") or final_.get("final_result") == "None":
            return {"message":"No Contact Found in the given number and Given name please make sure That the person is in your contact list","intrrupted_name":"final_result_failed"}
        result = insert_transaction('Grace Lee', final_['receiver_details'][1], final_.get("amount"))
        return{"message":final_,"intrrupted_name":"final_result"}
    else:
        return {"message": f"Graph or thread not initialized. Graph: {graph}, Thread: {thread}"}



def fetch_balances():
    try:
        connection = psycopg2.connect(
            dbname="bankapp",
            user="postgres",
            password="manu",
            host="localhost",
            port=5432
        )
        cursor = connection.cursor()
        fetch_balance_query = "SELECT * FROM users WHERE name = %s"

        cursor.execute(fetch_balance_query, ('Grace Lee',))
        sender_details = cursor.fetchone()

        if sender_details is None:
            return {'messages': "User 'Grace Lee' not found"}

        return {'details':sender_details }
    
    except Exception as e:
        return {'messages': f"An error occurred while fetching details: {e}"}
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

def fetch_balances1():
    try:
        connection = psycopg2.connect(
            dbname="userdetails",
            user="postgres",
            password="manu",
            host="localhost",
            port=5432
        )
        cursor = connection.cursor()
        fetch_balance_query = "SELECT * FROM transaction WHERE sen_name = %s"

        cursor.execute(fetch_balance_query, ('Grace Lee',))
        sender_details =cursor.fetchall()

        if sender_details is None:
            return {'messages': "User 'Grace Lee' not found"}

        return {'details':sender_details }
    
    except Exception as e:
        return {'messages': f"An error occurred while fetching details: {e}"}
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()


@app.get("/userdetails")
def UserInfo():
    result = fetch_balances()
    return result  

@app.get("/transactions")
def UserTransaction():
    result=fetch_balances1()
    new_list=[]
    for i,datas in enumerate(result['details']):
        details={
            "id":i+1,
            "description":datas[1],
            "amount":datas[2],
            "date":datas[3]
        }
        new_list.append(details)    
    return {"details":new_list}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
