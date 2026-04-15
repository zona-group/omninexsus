import { useParams } from 'react-router-dom'

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Article {id}</h1>
      <p>Article content here</p>
    </div>
  )
}

export default ArticleDetail