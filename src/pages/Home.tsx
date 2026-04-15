import { useNews } from '../context/NewsContext'

const Home = () => {
  const { articles } = useNews()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Latest News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="rounded-lg border p-4 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-600 mb-4">{article.description}</p>
            <a href={`/article/${article.id}`} className="text-primary hover:underline">Read more</a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home