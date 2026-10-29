import Share from "@/components/Share"
import variables from "@/variables/variables";
import { notFound } from 'next/navigation'

// Next 15+ passes route params to server components as a Promise, so they must
// be awaited before use. Reading params.id directly yields undefined, which
// made both the metadata fetch and the client reader request ?id=undefined.
export async function generateMetadata({ params }) {
    const { id } = await params;
    const url = variables.BACKEND_URL+"/api/v1/read/share?metafetch=true&id="+encodeURIComponent(id);
    const response = await fetch(url, {
        method: 'GET'
    }).then((request) => request.json()).catch(() => null)
    if(!response) {
        return {
            title: 'Markdown share',
        }
    }
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

export default async function Page({params}) {
    const { id } = await params;
    return <Share id={id}></Share>
}