'use client'

import { TabNav } from "@radix-ui/themes";

import Link from "next/link";
export default function NavBar(props) {
   return <TabNav.Root>
  <Link href={"/"}><TabNav.Link  active={props.active === "home" ?true : false}>Home
  </TabNav.Link></Link> 

  <Link href={"/new"}><TabNav.Link active={props.active === "new" ?true : false}>New share</TabNav.Link></Link>
  <a href={"https://github.com/spicybirsge/markdown-share/"} target="_blank"><TabNav.Link >Source Code</TabNav.Link></a>

</TabNav.Root>

}