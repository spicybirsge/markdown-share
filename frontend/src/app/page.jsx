
import variables from "@/variables/variables";
import NavBar from "@/components/NavBar";
import { Container, Text , Heading, Flex, Card, Box, Strong, Tooltip, Button} from "@radix-ui/themes";
import './page.module.css'
import timeStampToDate from "@/functions/timeStampToDate";
import Link from "next/link";
export default async function Home() {
  function truncateText(text) {
    const maxLength = 48;
    
    
  
    if (text.length > maxLength) {
    
        return text.slice(0, maxLength) + "...";
    }
    
   
    return text;
}
  const url = variables.BACKEND_URL+"/api/v1/read/latest-shares"
  const request = await fetch(url, {
    method: 'GET',
    next: {
      revalidate: 0, 
    }
  })
  const response = await request.json();
  const shares = response.data;
  return (
 <>
    <NavBar active={"home"} ></NavBar>
    <div style={{marginBottom: "25px"}}></div>
    <Container>
<Heading as="h1">Markdown Share</Heading>

<Text as="p">Welcome to markdown share, and alternative to the usual codebins. Here instead of sharing just the code you share markdown and if you want to add code you can just write a codeblock and share it. This methods makes it easier for you to write things like the error, explain what is wrong, etc.</Text>
<div style={{marginBottom: "25px"}}></div>
<Heading as="h1" align={"center"}>Recent Shares</Heading>
<div style={{marginBottom: "25px"}}></div>
<Flex gap={"4"} wrap={"wrap"} justify={"center"}>
{shares.map(i => (
  <Box width={"500px"} >
  <Card size={"2"} >
  <Text  size={"6"}>
   <Strong> {i.title}</Strong>
          </Text> <div style={{marginBottom: "5px"}}></div>
          
     <Text as="p" title={i.description || "No description"}>{truncateText(i.description || "No description")}
          </Text>
          
          <div style={{marginBottom: "5px"}}></div>
          <Text as="p">Created on <Strong>{timeStampToDate(i.createdAt*1)}</Strong></Text>
          <div style={{marginBottom: "5px"}}></div>
          <Text as="p"><Strong>{i.views } views</Strong>
          </Text>
          <div style={{marginBottom: "10px"}}></div>
          <Link href={"/share/"+i._id}><Button style={{marginBottom: "0"}} size={"2"} variant="soft">View</Button></Link>
  </Card></Box>
))}
</Flex>
  </Container>
  </>
  );
}
