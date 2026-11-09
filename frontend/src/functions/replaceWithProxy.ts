import variables from "@/variables/variables";

export default function replaceWithProxy(markdownText: string, proxyUrl = variables.PROXY_URL + "/proxy?url=") {

  const imagePattern = /!\[(.*?)\]\((.*?)\)/g;
  const imgTagPattern = /<img\s+[^>]*src="([^"]*)"[^>]*>/g;

  let sanitizedText = markdownText.replace(imagePattern, (match: string, altText: string, imageUrl: string) => {
    if (imageUrl.startsWith(proxyUrl)) {
      return match;
    }
    return `![${altText}](${proxyUrl}${encodeURIComponent(imageUrl)})`;
  });

  sanitizedText = sanitizedText.replace(imgTagPattern, (match: string, imageUrl: string) => {
    if (imageUrl.startsWith(proxyUrl)) {
      return match;
    }
    const newTag = match.replace(imageUrl, `${proxyUrl}${encodeURIComponent(imageUrl)}`);
    return newTag;
  });

  return sanitizedText;
}
