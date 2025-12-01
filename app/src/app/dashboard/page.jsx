export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Customers</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Active Tables</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="text-gray-500 text-center py-8">
              No recent orders
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                New Order
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                View Menu
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                Manage Tables
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}