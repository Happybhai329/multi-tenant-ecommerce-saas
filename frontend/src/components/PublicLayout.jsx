import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Zalima SaaS. All rights reserved. Built for scale.
      </footer>
    </div>
  )
}

export default PublicLayout
