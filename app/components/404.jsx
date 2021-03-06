import React, {useEffect} from "react"
import {Link} from "react-router-dom"
import Page from "./Page.jsx"

function NotFound(props) {
  return (
    <Page title="not found!">
      <div className="container py-md-5 container--narrow">
        <div className="text-center">
          <h2>Whoops, we cannot find that page.</h2>
          <p className="lead text-muted">
            You can always visit the <Link to="/">homepage</Link> to get a fresh start.
          </p>
        </div>
      </div>
    </Page>
  )
}

export default NotFound
