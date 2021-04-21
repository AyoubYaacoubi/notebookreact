import React, {useState, useReducer, useEffect, Suspense} from "react"
import ReactDOM from "react-dom"
import {BrowserRouter, Switch, Route} from "react-router-dom"
import {useImmerReducer} from "use-immer"
import {CSSTransition} from "react-transition-group"
import Axios from "axios"
Axios.defaults.baseURL = process.env.BACKENDURL || "https://notebook-yaacoubi.herokuapp.com/api"

// Our contexts
import DispatchContext from "./DispatchContext.jsx"
import StateContext from "./StateContext.jsx"

// Our Component:
import Header from "./components/Header.jsx"
import Footer from "./components/Footer.jsx"
import HomeGuest from "./components/HomeGuest.jsx"

import Home from "./components/Home.jsx"
const Profile = React.lazy(() => import("./components/Profile.jsx"))
// import Profile from "./components/Profile.jsx"
const CreatePost = React.lazy(() => import("./components/CreatePost.jsx"))
// import CreatePost from "./components/CreatePost.jsx"
const EditPost = React.lazy(() => import("./components/EditPost.jsx"))
// import EditPost from "./components/EditPost.jsx"
const SinglePostScreen = React.lazy(() => import("./components/SinglePostScreen.jsx"))
// import SinglePostScreen from "./components/SinglePostScreen.jsx"

import FlashMessages from "./components/FlashMessages.jsx"
import About from "./components/About.jsx"
import Terms from "./components/Terms.jsx"
import NotFound from "./components/404.jsx"

import Search from "./components/Search.jsx"

const Chat = React.lazy(() => import("./components/Chat.jsx"))
// import Chat from "./components/Chat.jsx"
import LoadingDotsIcon from "./components/LoadingDotsIcon.jsx"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("token")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("token"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("avatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadMessagesCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "increaseUnreadMessagesCount":
        draft.unreadMessagesCount++
        return
      case "resetUnreadMessagesCount":
        draft.unreadMessagesCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      let ourRequest = Axios.CancelToken.source()
      async function verifyToken() {
        try {
          const response = await Axios.post("/checkToken", {token: state.user.token}, {cancelToken: ourRequest.token})
          if (!response.data) {
            console.log("token is still valid!")
            dispatch({type: "logout"})
            dispatch({type: "flashMessage", value: {msg: "Your sessoin has been expired! please login again.", mode: "danger"}})
          }
        } catch (e) {
          console.log("we ran into a problem!")
        }
      }
      verifyToken()
      return () => ourRequest.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("token", state.user.token)
      localStorage.setItem("username", state.user.username)
      localStorage.setItem("avatar", state.user.avatar)
    } else {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("avatar")
    }
  }, [state.loggedIn])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header loggedIn={state.loggedIn} />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id" exact>
                <SinglePostScreen />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames={"search-overlay"} unmountOnExit>
            <Search />
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
