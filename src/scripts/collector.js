import fs from 'fs'
import path from 'path'

const extensions = ['.png', '.jpg', '.jpeg', '.gif']
const useInfo = [
  {name: 'full', abbrev: 'f', suffix: ''},
  {name: 'toc', abbrev: 't', suffix: '_toc'},
  {name: 'preview', abbrev: 'p', suffix: '_preview'},
  {name: 'bubble', abbrev: 'b', suffix: '_bubble'},
]
const abbrevs = useInfo.map(use => use.abbrev)

// (from chatgpt)
function extractText(node) {
  if (!node.children) return '';

  return node.children
    .map((child) => {
      if (child.type === 'text') {
        return child.value;
      }
      return extractText(child);
    })
    .join('');
}

function setID(node, id) {
  if (!node.data) node.data = {}
  if (!node.data.hProperties) node.data.hProperties = {}
  node.data.id = node.data.hProperties.id = id
}

export function collector() {
  return function (tree, file) {
    // fs.writeFile('test74.json', JSON.stringify(tree, null, 2), (err) => {})

    let headingIndex = 1
    const toc = []
    const ancestors = Array(5).fill(null)

    for (let node of tree.children) {
      const isImg = node.type === 'mdxJsxFlowElement' && node.name === 'Img'
      if (!(isImg || node.type === 'paragraph' || node.type === 'heading' || node.type === 'list')) continue

      let id = `${headingIndex}`

      if (isImg) {
        node.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'id',
            value: id,
        })
        const idAttr = node.attributes.find(attribute => attribute.name === 'id')
        if (idAttr) {id = idAttr.value}
      } else {
        setID(node, id)
      }

      const tocItem = {}

      if (node.type === 'list') {
        tocItem.ancestors = ancestors.slice()
        tocItem.type = 'list'
        tocItem.ordered = node.ordered

        const items = []
        for (let item of node.children) {
          id = `${headingIndex}`
          setID(item, id)
          items.push(id)
          headingIndex++;
        }
        tocItem.items = items
      } else {
        tocItem.id = id

        if (node.type === 'heading') {
          tocItem.depth = node.depth

          for (let depth = node.depth - 2; depth < 5; depth++) {
            ancestors[depth] = null
          }
          tocItem.ancestors = ancestors.slice()
          ancestors[node.depth - 2] = id

          tocItem.plaintextContents = extractText(node)
        } else {
          tocItem.ancestors = ancestors.slice()
        }
      
        if (isImg) {
          tocItem.type = 'image'
        } else {
          tocItem.type = node.type
        }

        if (node.type == 'paragraph') {
          tocItem.length = extractText(node).length
        }
        
        if (isImg) {
          const mainImgPath = 'src/assets/work/' + node.attributes.find(attribute => attribute.name === 'src').value
          const parentPath = path.dirname(mainImgPath)
          const mainExtension = path.extname(mainImgPath)
          const filename = path.basename(mainImgPath, mainExtension)
          const uses = (node.attributes.find(attribute => attribute.name == 'uses') || {value: 'f'}).value
          
          const tocImage = {}
          let last = mainImgPath;
          for (let {name, abbrev, suffix} of useInfo) {
            if (!uses.includes(abbrev)) continue

            let found = false
            for (let extension of [mainExtension, ...extensions]) {
              let pathToCheck = `${parentPath}/${filename}${suffix}${extension}`
              if (abbrev === 'f' || fs.existsSync(pathToCheck)) {
                found = true
                tocImage[name] = pathToCheck
                last = pathToCheck
                break
              }
            }
            if (!found) tocImage[name] = last
          }

          tocItem.image = tocImage
        }
        
        headingIndex++
      }

      toc.push(tocItem)
    }
    file.data.astro.frontmatter.toc = toc
  }
}