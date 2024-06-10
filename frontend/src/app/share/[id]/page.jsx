import Share from "@/components/Share"
import variables from "@/variables/variables";
import { notFound } from 'next/navigation'
export async function generateMetadata({ params}) {
    const url = variables.BACKEND_URL+"/api/v1/read/share?metafetch=true&id="+params.id;
    const request = await fetch(url, {
        method: 'GET'
    })
    const response = await request.json()
    if(!response.success) {
        return notFound()
    }
return {
    title: response.data.title,
    description: response.data.description || "No description",
    keywords: ['markdown share', 'markdown', 'share', 'markdown post', 'post'],
    icons: {
      icon: '/assets/media/logo.png',
     
    },
    openGraph: {
      title: response.data.title,
      description: response.data.description || "No description",
      site_name: 'Markdown share',
      images: [
        {
          url: '/assets/media/logo.png',
        },
      ],
    },
  
  };
}

export default function Page({params}) {
    return <Share id={params.id}></Share>
}