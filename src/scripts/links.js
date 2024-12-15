export default function processLinks() {
  // from chatgpt

  document.querySelectorAll('a').forEach(link => {
    const currentUrl = new URL(window.location.href);
    const linkUrl = new URL(link.href, window.location.origin); // Resolve relative URLs
    
    // Check if the link is internal (same origin)
    if (linkUrl.origin === window.location.origin) {
      // Check if the 'unlisted-tag' parameter exists in the current URL
      const unlistedTag = currentUrl.searchParams.get('unlisted-tag');
      
      if (unlistedTag) {
        // Append the 'unlisted-tag' parameter to the link
        linkUrl.searchParams.set('unlisted-tag', unlistedTag);
        link.href = linkUrl.toString();
      }
    } else {
      link.target = "_blank"
      link.rel = "noopener noreferrer"
    }
  });
  
}