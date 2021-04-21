import React, {useContext, useEffect} from "react"
import {useImmer} from "use-immer"
import Axios from "axios"
import {Link} from "react-router-dom"
// Context:
import DispatchContext from "../DispatchContext.jsx"
import Post from "./Post.jsx"

function Search(props) {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  })

  useEffect(() => {
    document.addEventListener("keyup", keyPressHandler)
    return () => document.removeEventListener("keyup", keyPressHandler)
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++
        })
      }, 800)
      return () => clearTimeout(delay)
    } else {
      setState((draft) => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchData() {
        try {
          const response = await Axios.post("/search", {searchTerm: state.searchTerm}, {cancelToken: ourRequest.token})
          console.log(response.data)
          setState((draft) => {
            draft.results = response.data
          })
          setState((draft) => {
            draft.show = "results"
          })
        } catch (e) {
          console.log("we ran into a problem")
        }
      }
      fetchData()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function closeSearch() {
    appDispatch({type: "closeSearch"})
  }

  function keyPressHandler(e) {
    if (e.keyCode === 27) {
      appDispatch({type: "closeSearch"})
    }
  }

  function inputHandler(e) {
    setState((draft) => {
      draft.searchTerm = e.target.value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={inputHandler} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={closeSearch} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results </strong> ({state.results.length} {state.results.length > 1 ? " items" : " item"} found)
                </div>

                {state.results.map((result) => {
                  return <Post post={result} key={result._id} onClick={() => appDispatch({type: "closeSearch"})} />
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <div className="alert alert-danger text-center shadow-sm">there is no results for that search!</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
