
import variables from "@/variables/variables";
import NavBar from "@/components/NavBar";
import { Container, Text , Heading, Flex, Card, Box, Strong, Tooltip, Button} from "@radix-ui/themes";
import timeStampToDate from "@/functions/timeStampToDate";
import Link from "next/link";
import TimeAgo from "@/components/TimeAgo";
async function getShares() {
  let shares = null
try {
  const url = variables.BACKEND_URL+"/api/v1/read/latest-shares"
  const request = await fetch(url, {
    method: 'GET',
    next: {
      revalidate: 0, 
    }
  })
  const response = await request.json();
 shares = response.data;
 return shares
} catch (e) {
  console.log(e)
  }
  if(!shares) {
    return false;
  }
}
export default async function Home() {


let shares = await getShares()
if(!shares) {
  
  return <h1>Internal Server Error</h1>
}

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
<div  style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px", 
  width: "100%",
}}>
{shares.map(i => (
  <Box   key={i._id}>
  <Card size={"2"} style={{height: "218px",display: "flex", flexDirection: "column" }}>
  <Text  size={"6"} as="h1" title={i.title} style={{whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block"}}>
   <Strong> {i.title}</Strong>
          </Text> <div style={{marginBottom: "5px"}}></div>
          
     <Text as="p" title={i.description || "No description"} style={{whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block"}}>{i.description || "no description"}
          </Text>
          
          <div style={{marginBottom: "5px"}}></div>
          <Text as="p">Created <Strong><TimeAgo date={i.createdAt*1}></TimeAgo></Strong></Text>
          <div style={{marginBottom: "5px"}}></div>
          <Text as="p"><Strong>{i.views } views</Strong>
          </Text>
          <div style={{ flexGrow: 1 }}></div>
          <Link href={"/share/"+i._id} ><Button style={{ width: "100%", bottom: 0, left: 0}} size={"3"} radius={"full"} variant="surface">View</Button></Link>
  </Card></Box>
))}
{shares.length === 0 ? <Text>No Shares Yet...</Text> : <></>}
</div>
  </Container>
  </>
  );

}
