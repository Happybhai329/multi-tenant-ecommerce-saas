import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Multi-Tenant E-Commerce. All rights reserved.
      </footer>
    </div>
  )
}

export default PublicLayout
