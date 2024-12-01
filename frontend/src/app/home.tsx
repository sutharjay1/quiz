import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from "react-router";

export function Header() {
  return (
    <header className="py-4 px-6 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">QuizMaster</Link>
        <nav>
          <Link href="/signin" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to QuizMaster</h1>
          <p className="text-xl text-gray-600 mb-8">Challenge yourself with our curated quizzes</p>
          <Link to="/signin">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold">
              Start Quizzing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

