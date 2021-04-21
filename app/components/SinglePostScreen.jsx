import React, {useEffect, useState, useContext} from "react"
import {withRouter, useParams, Link} from "react-router-dom"
import Axios from "axios"
import ReactMarkd from "react-markdown"
import ReactTooltip from "react-tooltip"

// contexts:
import StateContext from "../StateContext.jsx"
import DispatchContext from "../DispatchContext.jsx"
// components:
import Page from "./Page.jsx"
import LoadingDotsIcon from "./LoadingDotsIcon.jsx"
import NotFound from "./404.jsx"

function SinglePostScreen(props) {
  const {id} = useParams()

  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const [isLoading, setIsLoading] = useState(true)

  const [post, setPost] = useState()

  function isVisitorOwner() {
    if (appState.loggedIn) {
      if (appState.user.username == post.author.username) {
        return true
      } else {
        return false
      }
    }
    return false
  }
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchData() {
      try {
        const response = await Axios.get(`/post/${id}`, {cancelToken: ourRequest.token})
        setPost(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("ops!")
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [id])

  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  let date = new Date(post.createdDate)
  let formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

  async function deleteHandler(e) {
    const areYouSure = window.confirm("do you want to delete this post!")
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {data: {token: appState.user.token}})
        if (response.data == "Success") {
          appDispatch({type: "flashMessage", value: {msg: "Post was successfully deleted!", mode: "success"}})
          props.history.push(`/profile/${appState.user.username}`)
        } else {
          console.log("no no!")
        }
      } catch (e) {
        console.log("ops again!")
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isVisitorOwner() && (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <a onClick={deleteHandler} className="delete-post-button text-danger" data-tip="delete" data-for="delete">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {formattedDate}
      </p>

      <div className="body-content">
        <ReactMarkd source={post.body} allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]} />
      </div>
    </Page>
  )
}

export default withRouter(SinglePostScreen)
