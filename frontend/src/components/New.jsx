'use client'
import replaceWithProxy from "@/functions/replaceWithProxy"
import { TextField, Text, Container, Heading, Strong , Switch, Button} from "@radix-ui/themes";
import NavBar from "@/components/NavBar";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import { useState } from "react";
import variables from "@/variables/variables";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
export default function Page() {
  const [title, setTitle] = useState(null)
  const [description, setDescription] = useState(null)
  const [content, setContent] = useState(null)
  const [creating, setCreating] = useState(false);
  const [unlisted, setUnlisted] = useState(false)

const router = useRouter()

  const createShare = async() => {
    try {
    
      setCreating(true)
const url = variables.BACKEND_URL+"/api/v1/create/share"
const request = await fetch(url, {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: title,
    description: description,
    content: content,
    isUnlisted: unlisted
  })


})

const response = await request.json()
if(response.success) {
  setCreating(false)
  const id = response.data._id;
router.push('/share/'+id, {scroll: false})
return;
} else {
  setCreating(false)
return toast.error(response.message || "An error occured")
}
} catch(e) {
  console.error(e) 
  return toast.error("An error occured")
}
  }






    return <> <Toaster></Toaster><NavBar active={"new"} ></NavBar>
     <div style={{marginBottom: "25px"}}></div>
      <Container>
<Heading as="h1" align={"center"}>Create a new share</Heading>
<div style={{marginBottom: "25px"}}></div>
<Text size={"6"}>Title</Text>
<TextField.Root placeholder="title" name="title" value={title} onChange={(e) => {setTitle(e.target.value)}} maxLength={70}></TextField.Root>
<div style={{marginBottom: "15px"}}></div>
<Text size={"6"}>Description</Text>
<TextField.Root placeholder="description" name="description" value={description} onChange={(e) => {setDescription(e.target.value)}} maxLength={180}></TextField.Root>
<div style={{marginBottom: "15px"}}></div>
<Text as="label">Unlisted <Switch checked={unlisted} size={"3"} onCheckedChange={() => {setUnlisted(!unlisted)}}></Switch></Text>
<div style={{marginBottom: "15px"}}></div>
<Text size={"6"}>Content</Text><div data-color-mode="light">
<MDEditor value={content} placeholder={"Your markdown content goes here..."} onChange={(e) => {setContent(replaceWithProxy(e))}} previewOptions={{rehypePlugins: [[rehypeSanitize]]}}></MDEditor></div>
<div style={{marginBottom: "15px"}}></div>
<Button loading={creating} onClick={createShare}>Create</Button>
      </Container>
    </>
}