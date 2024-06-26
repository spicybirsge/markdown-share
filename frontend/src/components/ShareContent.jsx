'use client'
import MDEditor from "@uiw/react-md-editor"
import rehypeSanitize from "rehype-sanitize"
export default function ShareContent(props) {

    return <div data-color-mode="light"><MDEditor.Markdown source={props.content} rehypePlugins={[rehypeSanitize]} style={{minHeight: "100vh"}}></MDEditor.Markdown></div>
}