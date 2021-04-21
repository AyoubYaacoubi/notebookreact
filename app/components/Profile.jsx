import React, {useEffect, useContext, useState} from "react"
import Axios from "axios"
import {useParams, NavLink, Switch, Route} from "react-router-dom"
import {useImmer} from "use-immer"

// components:
import Page from "./Page.jsx"
import ProfilePosts from "./ProfilePosts.jsx"

// context:
import DispatchContext from "../DispatchContext.jsx"
import StateContext from "../StateContext.jsx"
import ProfileFollows from "./ProfileFollows.jsx"

function Profile(props) {
  const appState = useContext(StateContext)
  const appDisptach = useContext(DispatchContext)
  const {username} = useParams()
  const [state, setState] = useImmer({
    actionLoading: false,
    startFollowRequestCount: 0,
    stopFollowRequestCount: 0,
    followAction: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://www.gravatar.com/avatar/placeholder/?s=128",
      isFollowing: false,
      counts: {
        postCount: "",
        followerCount: "",
        followingCount: "",
      },
    },
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, {token: appState.user.token}, {cancelToken: ourRequest.token})
        setState((draft) => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("nope!")
      }
    }
    fetchData()
    return () => ourRequest.cancel("landing has been interepted")
  }, [username])

  useEffect(() => {
    if (state.startFollowRequestCount) {
      setState((draft) => {
        draft.actionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, {token: appState.user.token}, {cancelToken: ourRequest.token})
          setState((draft) => {
            draft.profileData.isFollowing = true
            draft.followAction++
            draft.profileData.counts.followerCount++
            draft.actionLoading = false
          })
          appDisptach({type: "flashMessage", value: {msg: `you've successfully started following ${state.profileData.profileUsername}`, mode: "success"}})
        } catch (e) {
          console.log("ops, we ran into a problem!")
        }
      }
      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.startFollowRequestCount])

  useEffect(() => {
    if (state.stopFollowRequestCount) {
      setState((draft) => {
        draft.actionLoading = true
      })
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, {token: appState.user.token}, {cancelToken: ourRequest.token})
          setState((draft) => {
            draft.profileData.isFollowing = false
            draft.followAction--
            draft.profileData.counts.followerCount--
            draft.actionLoading = false
          })
          appDisptach({type: "flashMessage", value: {msg: `you've successfully stopped following ${state.profileData.profileUsername}`, mode: "success"}})
        } catch (e) {
          console.log("ops, we ran into a problem!")
        }
      }
      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.stopFollowRequestCount])

  function startFollowing() {
    setState((draft) => {
      draft.startFollowRequestCount++
    })
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowRequestCount++
    })
  }
  return (
    <Page title={state.profileData.profileUsername}>
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {state.profileData.profileUsername != "..." && state.profileData.profileUsername != appState.user.username && !state.profileData.isFollowing && appState.loggedIn && (
          <button onClick={startFollowing} disabled={state.actionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {state.profileData.profileUsername != "..." && state.profileData.profileUsername != appState.user.username && state.profileData.isFollowing && appState.loggedIn && (
          <button onClick={stopFollowing} disabled={state.actionLoading} className="btn btn-danger btn-sm ml-2">
            stop Follow <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink exact to={`/profile/${state.profileData.profileUsername}`} className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollows action="followers" followAction={state.followAction} />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollows action="following" followAction={state.followAction} />
        </Route>
      </Switch>
    </Page>
  )
}

export default Profile
