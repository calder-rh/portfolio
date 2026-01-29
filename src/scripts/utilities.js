import { getEntry } from 'astro:content'

export function hasPage(item) {
  return item.filePath?.match(/^src\/items\/page\//) && item.data.page !== 'none'
}

export async function inferTags(tags, unlisted) {
  const allTags = tags.slice() || []
  for (let i = 0; i < allTags.length; i++) {
    const tag = allTags[i]
    const tagData = await getEntry('items', tag)
    if (!tagData) continue
    let parents = tagData.data.tags
    if (!parents) continue
    for (let parent of parents) {
      if (!allTags.includes(parent.id)) {
        allTags.push(parent.id)
      }
    }
  }
  if (!unlisted){
    allTags.push('all')
  }
  return allTags
}