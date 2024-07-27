import { getEntry } from 'astro:content'

export async function inferTags(tags) {
  const allTags = tags.slice()
  for (let i = 0; i < allTags.length; i++) {
    const tag = allTags[i]
    const tagData = await getEntry('tags', tag)
    if (!tagData) continue
    let parents = tagData.data.parents
    if (!parents) continue
    for (let parent of parents) {
      allTags.push((await getEntry('tags', parent.slug)).data.name)
    }
  }
  allTags.push('all')
  return allTags
}