'use client'
import ReactTimeAgo from "react-timeago"
export default function TimeAgo(props) {
return <ReactTimeAgo date={props.date} title={null}></ReactTimeAgo>
}