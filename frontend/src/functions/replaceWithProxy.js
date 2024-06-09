import variables from "@/variables/variables";

export default function replaceWithProxy(markdownText, proxyUrl = variables.BACKEND_URL + "/proxy?url=") {

  const imagePattern = /!\[(.*?)\]\((.*?)\)/g;
  const imgTagPattern = /<img\s+[^>]*src="([^"]*)"[^>]*>/g;

 
  let sanitizedText = markdownText.replace(imagePattern, (match, altText, imageUrl) => {
    return `![${altText}](${proxyUrl}${encodeURIComponent(imageUrl)})`;
  });


  sanitizedText = sanitizedText.replace(imgTagPattern, (match, imageUrl) => {
    const newTag = match.replace(imageUrl, `${proxyUrl}${encodeURIComponent(imageUrl)}`);
    return newTag;
  });

  return sanitizedText;
}
