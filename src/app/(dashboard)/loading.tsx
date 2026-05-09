import Sidebar from "@/components/layout/Sidebar"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar role="PATIENT" userName="Loading..." />
      <div className="lg:pl-72">
        <div className="p-6 lg:p-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-card">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-card">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
