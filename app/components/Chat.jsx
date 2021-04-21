import React, {useContext, useEffect, useRef} from "react"
import ReactTooltip from "react-tooltip"
import {useImmer} from "use-immer"
import io from "socket.io-client"

// contexts
import DispatchContext from "../DispatchContext.jsx"
import StateContext from "../StateContext.jsx"
import {Link} from "react-router-dom"

function Chat(props) {
  const socket = useRef(null)
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    chatFieldValue: "",
    chatMessages: [],
  })
  const chatField = useRef(null)
  const chatLog = useRef(null)
  useEffect(() => {
    if (appState.isChatOpen) {
      appDispatch({type: "resetUnreadMessagesCount"})
      chatField.current.focus()
    }
  }, [appState.isChatOpen])

  // open the chat io connection: ***
  useEffect(() => {
    socket.current = io(process.env.BACKENDURL || "https://notebookreactapi.herokuapp.com")
    socket.current.on("chatFromServer", (message) => {
      setState((draft) => {
        draft.chatMessages.push(message)
      })
    })
    return () => socket.current.disconnect()
  }, [])

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight
    if (state.chatMessages.length && !appState.isChatOpen) {
      console.log(appState.unreadMessagesCount)
      appDispatch({type: "increaseUnreadMessagesCount"})
    }
  }, [state.chatMessages])

  function handleFieldChange(e) {
    let value = e.target.value
    setState((draft) => {
      draft.chatFieldValue = value
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // send the message to the chat server: ***
    socket.current.emit("chatFromBrowser", {message: state.chatFieldValue, token: appState.user.token})
    // user interface:
    setState((draft) => {
      // add message to the messages state collection.
      draft.chatMessages.push({message: draft.chatFieldValue, username: appState.user.username, avatar: appState.user.avatar})
      draft.chatFieldValue = ""
    })
  }

  return (
    <>
      <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right" + (appState.isChatOpen ? " chat-wrapper--is-visible" : "")}>
        <div className="chat-title-bar bg-primary">
          Chat
          <span onClick={() => appDispatch({type: "closeChat"})} data-for="chat-close" data-tip="Close" className="chat-title-bar-close">
            <i className="fas fa-times-circle"></i>
          </span>
          <ReactTooltip id="chat-close" className="custom-tooltip" place="top" />
        </div>
        <div id="chat" ref={chatLog} className="chat-log">
          {state.chatMessages.map((message, index) => {
            if (message.username == appState.user.username) {
              return (
                <div key={index} className="chat-self">
                  <div className="chat-message">
                    <div className="chat-message-inner">{message.message}</div>
                  </div>
                  <img className="chat-avatar avatar-tiny" src={message.avatar} />
                </div>
              )
            } else {
              return (
                <div key={index} className="chat-other">
                  <Link to={`/profile/${message.username}`}>
                    <img className="avatar-tiny" src={message.avatar} />
                  </Link>
                  <div className="chat-message">
                    <div className="chat-message-inner">
                      <Link to={`/profile/${message.username}`}>
                        <strong>{message.username}:</strong>{" "}
                      </Link>
                      {message.message}
                    </div>
                  </div>
                </div>
              )
            }
          })}
        </div>
        <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
          <input value={state.chatFieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
        </form>
      </div>
    </>
  )
}

export default Chat
