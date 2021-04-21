import React, {useContext, useEffect} from "react"
import {useParams} from "react-router"
import {useImmerReducer} from "use-immer"
import {Link, withRouter} from "react-router-dom"
import Axios from "axios"

// components:
import Page from "./Page.jsx"
import LoadingDotsIcon from "./LoadingDotsIcon.jsx"

// context:
import StateContext from "../StateContext.jsx"
import DispatchContext from "../DispatchContext.jsx"
import NotFound from "./404.jsx"

function EditPost(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isLoading: true,
    saving: {isSaving: false, btnValue: "save Update"},
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchingComplete":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isLoading = false
        return
      case "titleChange":
        draft.title.hasErrors = false
        draft.title.value = action.value
        return
      case "bodyChange":
        draft.body.hasErrors = false
        draft.body.value = action.value
        return
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        return
      case "savingStarted":
        draft.saving.isSaving = true
        draft.saving.btnValue = action.value
        return
      case "savingEnded":
        draft.saving.isSaving = false
        draft.saving.btnValue = action.value
        return
      case "titleRules":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = "you must provide a title!"
        }
        return
      case "bodyRules":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = "you must fill in the body!"
        }
        return
      case "notFound":
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState)

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({type: "titleRules", value: state.title.value})
    dispatch({type: "bodyRules", value: state.body.value})
    dispatch({type: "submitRequest"})
  }

  // fetching the data:
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchData() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {cancelToken: ourRequest.token})
        if (response.data) {
          dispatch({type: "fetchingComplete", value: response.data})

          if (appState.user.username != response.data.author.username) {
            appDispatch({type: "flashMessage", value: {msg: "you don't have permission to edit that post!", mode: "danger"}})
            props.history.push("/")
          }
        } else {
          dispatch({type: "notFound"})
        }
      } catch (e) {
        console.log("ops, a problem happend!")
      }
    }

    fetchData()
    return () => ourRequest.cancel()
  }, [])

  // sending the data:
  useEffect(() => {
    if (state.sendCount) {
      dispatch({type: "savingStarted", value: "saving ..."})
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post(`/post/${state.id}/edit`, {title: state.title.value, body: state.body.value, token: appState.user.token}, {cancelToken: ourRequest.token})
          dispatch({type: "savingEnded", value: "save Update"})
          appDispatch({type: "flashMessage", value: {msg: "Post has been successfully Updated!", mode: "success"}})
        } catch (e) {
          console.log("ops, a problem happend!")
        }
      }

      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isLoading) {
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )
  }

  return (
    <Page title="Edit post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        &laquo; back to permalink
      </Link>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input onBlur={(e) => dispatch({type: "titleRules", value: e.target.value})} onChange={(e) => dispatch({type: "titleChange", value: e.target.value})} value={state.title.value} autoFocus name="title" id="post-title" className="form-control form-control-lg form-control-title" type="text" placeholder="" autoComplete="off" />
          {state.title.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea onBlur={(e) => dispatch({type: "bodyRules", value: e.target.value})} onChange={(e) => dispatch({type: "bodyChange", value: e.target.value})} value={state.body.value} name="body" id="post-body" className="body-content tall-textarea form-control" type="text" />
          {state.body.hasErrors && <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>}
        </div>

        <button disabled={state.saving.isSaving} className="btn btn-primary">
          {state.saving.btnValue}
        </button>
      </form>
    </Page>
  )
}

export default withRouter(EditPost)
