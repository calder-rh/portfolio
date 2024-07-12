// Function to set or update a URL parameter
function setUrlParameter(key, value) {
  // Get the current URL
  const url = new URL(window.location.href)

  // Set or update the parameter
  url.searchParams.set(key, value)

  // Update the URL in the browser without reloading the page
  window.history.pushState({}, '', url)
}