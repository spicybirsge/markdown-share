'use client'
import { Spinner, Container, Text, Strong, Separator, Button } from "@radix-ui/themes"
import { useEffect, useState } from "react"
import ShareContent from "./ShareContent"
import NavBar from "./NavBar"
import variables from "@/variables/variables"
import timeStampToDate from "@/functions/timeStampToDate"
import replaceWithProxy from "@/functions/replaceWithProxy"
import Link from "next/link"
import { useRouter } from "next/navigation"
export default function Share(props) {
    const router = useRouter()
    const {back} = useRouter()
    const [loading, setLoading] = useState(true)
    const [share, setShare] = useState(null)
    const [exist, setExist] = useState(true)
    useEffect(() => {
        async function fetchShare() {
            const url = variables.BACKEND_URL+"/api/v1/read/share?id="+props.id
            const request = await fetch(url, {
                method: 'GET'
            })
            const response = await request.json()
            if(response.success) {
            setShare(response.data)
            setLoading(false)
        } else {
setExist(false);
            }
        }
        fetchShare()
    }, [])

    if(!exist) {
        return <><h1>Error: 404 page not found</h1>
        <p>Go <Link href={"/"}>back?</Link></p></>

    }

    if(loading) {
        return <><NavBar></NavBar>
         <div className="loading-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh'}}>
        <Spinner size={"3"}></Spinner></div>
        </>
    }
    return <><NavBar></NavBar>
    <Container>
    <div style={{marginBottom: "25px"}}></div>
    <Button variant="ghost" size={"4"} color="gray" highContrast onClick={() => {back()}}><svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg></Button>
    <div style={{marginBottom: "5px"}}></div>
    <Text size={"7"}><Strong>{share?.title}</Strong></Text>
    <div style={{marginBottom: "5px"}}></div>
    <Text as="p" size={"5"}>{share?.description || "No description"}</Text>
    <div style={{marginBottom: "5px"}}></div>
    <Text size={"2"}>Created on {timeStampToDate(share?.createdAt*1)}</Text>
    <div style={{marginBottom: "5px"}}></div>
    <Text size={"2"}>{share?.views} views</Text>
    <Separator my="3" size="4" />
    <ShareContent content={replaceWithProxy(share?.content)} ></ShareContent>
    <Separator my="3" size="4" />
        </Container></>
}