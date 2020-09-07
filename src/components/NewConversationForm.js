import React, { useState } from 'react';
import { API_ROOT, HEADERS } from '../constants/index.js';

const NewConversationForm = (props)=>{
  const [newConversation, setNewConversation] = useState();


  const handleSubmit = (event) =>{
    event.preventDefault();

    fetch(`${API_ROOT}/conversations`,{
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({conversation: { title: newConversation}})
    }).then(()=>{
      document.getElementById('conversation-form').reset();
    });
  }

  const handleChange = (event)=>{
    setNewConversation(event.currentTarget.value);
  }

  return (
    <form id='conversation-form' onSubmit={handleSubmit} >
      <label className="label">New conversation</label>

      <input onChange={handleChange} className="input" type="text" placeholder="Text input"/>

      <button className='button mt-1'>Create Conversation</button>
    </form>
  )
}


export default NewConversationForm;
