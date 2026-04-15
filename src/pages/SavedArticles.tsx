import { useAuth } from '../context/AuthContext'

const SavedArticles = () => {
  const { user } = useAuth()

  if (!user) {
    return <div className="text-center py-12">Please login to view saved articles</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Saved Articles</h1>
      <p>Your saved articles will appear here</p>
    </div>
  )
}

export default SavedArticles