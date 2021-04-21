import React, {useEffect, useState, useContext} from "react"
import {useParams, Link} from "react-router-dom"
import Axios from "axios"

// Contexts:

// components:
import Page from "./Page.jsx"
import LoadingDotsIcon from "./LoadingDotsIcon.jsx"

function ProfileFollows(props) {
  const {username} = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const [follows, setFollows] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/${props.action}`, {cancelToken: ourRequest.token})
        console.log(response.data)
        setIsLoading(false)
        setFollows(response.data)
      } catch (e) {
        console.log("ops, nope again!")
      }
    }

    fetchData()

    return () => ourRequest.cancel("landing has been interepted")
  }, [username, props.action, props.followAction])

  if (isLoading)
    return (
      <Page title={username}>
        <LoadingDotsIcon />
      </Page>
    )

  if (!follows.length) {
    return (
      <div className="container py-md-5 container--narrow">
        <div className="text-center">
          <h2>this Profile has no {props.action == "followers" ? "followers" : "followings"} currently?</h2>
        </div>
      </div>
    )
  }
  return (
    <div className="list-group">
      {follows.map((follow, index) => {
        return (
          <Link key={index} to={`/profile/${follow.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follow.avatar} /> <strong>{follow.username}</strong>
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollows
