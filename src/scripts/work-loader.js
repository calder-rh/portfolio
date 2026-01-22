import { getCollection, render } from 'astro:content'

export async function workLoader() {
  const projects = await getCollection('projects')
  const entries = []
  let id = 0
  for (let project of projects) {
    const { remarkPluginFrontmatter } = await render(project)
    console.log(remarkPluginFrontmatter)
    entries.push({
      id: `${id}`,
      title: project.data.title
    })
    id++;
  }
  return entries;
}