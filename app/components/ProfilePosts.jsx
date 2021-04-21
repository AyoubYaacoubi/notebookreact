import React, {useEffect, useState, useContext} from "react"
import {useParams, Link} from "react-router-dom"
import Axios from "axios"

// Contexts:

// components:
import Page from "./Page.jsx"
import Post from "./Post.jsx"
import LoadingDotsIcon from "./LoadingDotsIcon.jsx"

function ProfilePosts(props) {
  const {username} = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {cancelToken: ourRequest.token})
        setIsLoading(false)
        setPosts(response.data)
      } catch (e) {
        console.log("ops, nope again!")
      }
    }

    fetchData()

    return () => ourRequest.cancel("landing has been interepted")
  }, [username])

  if (isLoading)
    return (
      <Page title={username}>
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post post={post} key={post._id} isProfile={true} />
      })}
    </div>
  )
}

export default ProfilePosts
