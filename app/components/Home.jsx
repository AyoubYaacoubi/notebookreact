import React, {useEffect, useContext, useState} from "react"
import Axios from "axios"
import {useImmer} from "use-immer"

import Page from "./Page.jsx"
import StateContext from "../StateContext.jsx"
import LoadingDotsIcon from "./LoadingDotsIcon.jsx"
import Post from "./Post.jsx"

function Home(props) {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  })

  useEffect(() => {
    let ourRequest = Axios.CancelToken.source()
    async function fetchData() {
      const response = await Axios.post("/getHomeFeed", {token: appState.user.token}, {cancelToken: ourRequest.token})
      setState((draft) => {
        draft.feed = response.data
      })
      setState((draft) => {
        draft.isLoading = false
      })
    }
    fetchData()
    return () => ourRequest.cancel()
  }, [])

  if (state.isLoading) {
    return (
      <Page title="Home Feed">
        <LoadingDotsIcon />
      </Page>
    )
  }

  return (
    <Page title="Home Feed">
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
      {state.feed.length > 0 && (
        <>
          <div className="container container--narrow py-md-5">
            <h2 className="text-center mb-4">The Latest From Those You Follow</h2>
            <div className="list-group">
              {state.feed.map((post) => {
                return <Post post={post} key={post._id} />
              })}
            </div>
          </div>
        </>
      )}
    </Page>
  )
}

export default Home
