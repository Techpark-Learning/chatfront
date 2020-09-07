import React, {useState, useEffect} from 'react';
import { ActionCable } from 'react-actioncable-provider';
import { API_ROOT, HEADERS } from '../constants/index.js';
import NewConversationForm from './NewConversationForm.js';

const ConversationsList = (props) =>{
  const [conversations, setConversations] = useState([]);
  const [currentMessage, setCurrentMessage] = useState();
  const [activeConversationId, setActiveConversationId] = useState();

  useEffect(()=>{
    fetch(`${API_ROOT}/conversations`)
    .then(res => res.json())
    .then(conversations => {
      setConversations(conversations);
    });
  },[])

  const handleRecieveConversation = (data)=>{
    setConversations([...conversations, data.conversation])
  }

  const handleTab = (event, conversation_id) =>{
    Array.from(document.getElementsByClassName('tab')).forEach((el)=>{
      el.classList.remove('is-active');
    });
    setActiveConversationId(conversation_id);
    event.target.closest('li').classList.add('is-active');
  }

  const handleMessageChange = (event)=>{
    setCurrentMessage(event.target.value);
  }

  const handleMessageSubmit = (event)=>{
    event.preventDefault();

    if(activeConversationId) {
      fetch(`${API_ROOT}/messages`,{
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          message: {
            text: currentMessage,
            conversation_id: activeConversationId
          }
        })
      }).then(()=>{
        document.getElementById('message-form').reset();
      });

    } else {
      alert("There are no active conversations")
    }
  }

  const handleRecieveMessage = (data)=> {
    console.log(data)
    const targetConversations = [...conversations]
    const targetC = targetConversations.find(conversation=>{
      return conversation.id === data.message.conversation_id
    })

    if(targetC){
      targetC.messages = [...targetC.messages, data.message]
    }

    setConversations(targetConversations);
  }

  const renderMessages = () =>{
    let currentC = conversations.find(conversation=>{
      return conversation.id === activeConversationId
    })

   if(currentC) {
      return (
        <ul>
          {
            currentC.messages.sort(
              (msg1, msg2) => new Date(msg1.created_at) - new Date(msg2.created_at)
            ).map((msg, index) =>{
              let timestamp = new Intl.DateTimeFormat('en-US',{
                'dateStyle': "long",
                'timeStyle': "short"
              }).format(new Date(msg.created_at))

              return (
                <li key={index}>
                  {timestamp}: {msg.text}
                </li>
              )
            })
          }
        </ul>
      )
   }
  }

  return (
    <div className="columns">
      <ActionCable
        channel={ {channel: 'ConversationsChannel'} }
        onReceived={handleRecieveConversation}
        />
      <div className="column is-10 is-offset-1 mt-1 has-text-left">

        <NewConversationForm />
        <div className="tabs">
          <ul>
            {
              conversations.map((conversation, index)=>{
                return <ActionCable
                          key={index}
                          channel={{ channel: 'MessagesChannel', conversation: conversation.id}}
                          onReceived={handleRecieveMessage}
                        />
              })
            }

            {
              conversations.map((conversation, index)=>{
                return (<li onClick={(event)=>{ handleTab(event, conversation.id) }} className='tab' key={conversation.id} ><a>{conversation.title}</a></li>)
              })
            }
          </ul>
        </div>
        <div className="box message-area">

        {renderMessages()}
        </div>



        <form id="message-form" onSubmit={handleMessageSubmit}>
          <div className="field has-addons">
            <p className="control is-expanded">
              <input onChange={handleMessageChange} className="input" type="text"/>
            </p>
            <p className="control"><button className="button is-info">Send</button></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConversationsList;
