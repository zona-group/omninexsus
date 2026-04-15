import { useSearchParams } from 'react-router-dom'

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Search Results for \"{query}\"</h1>
      <p>Results will appear here</p>
    </div>
  )
}

export default SearchResults