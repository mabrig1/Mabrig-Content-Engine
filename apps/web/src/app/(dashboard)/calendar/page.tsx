export const metadata = { title: 'Calendar' };

export default function CalendarPage() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-gray-400 text-sm mt-1">Visualize and manage your publishing schedule</p>
        </div>
      </div>
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h2 className="text-xl font-bold text-white mb-2">Calendar View</h2>
        <p className="text-gray-400 text-sm">Interactive drag-and-drop calendar coming soon. Schedule and manage all your posts visually.</p>
      </div>
    </div>
  );
}
