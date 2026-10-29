'use client'

import { TabNav } from "@radix-ui/themes";

import Link from "next/link";
export default function NavBar(props) {
   return <TabNav.Root>
  <TabNav.Link asChild active={props.active === "home"}>
    <Link href={"/"}>Home</Link>
  </TabNav.Link>

  <TabNav.Link asChild active={props.active === "new"}>
    <Link href={"/new"}>New Share</Link>
  </TabNav.Link>

  <TabNav.Link asChild>
    <a href={"https://github.com/spicybirsge/markdown-share/"} target="_blank" rel="noreferrer">Source Code</a>
  </TabNav.Link>

</TabNav.Root>

}