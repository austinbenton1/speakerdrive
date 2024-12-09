import React, { useState } from 'react';
import { Users, Unlock, Mail, Calendar, ArrowUpRight, ArrowDownRight, Send } from 'lucide-react';

const stats = [
  {
    name: 'Recent Leads Added',
    value: '245',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
  },
  {
    name: 'Total Leads Unlocked',
    value: '38',
    change: '+8.2%',
    trend: 'up',
    icon: Unlock,
  },
  {
    name: 'Contacts Unlocked',
    value: '26',
    change: '+15.4%',
    trend: 'up',
    icon: Mail,
  },
  {
    name: 'Events Unlocked',
    value: '12',
    change: '+4.1%',
    trend: 'up',
    icon: Calendar,
  },
];

const recentUnlocks = [
  {
    name: 'TechConf 2024',
    type: 'Event',
    date: '2h ago',
    status: 'success',
  },
  {
    name: 'Sarah Martinez',
    type: 'Contact',
    date: '4h ago',
    status: 'success',
  },
  {
    name: 'AI Summit',
    type: 'Event',
    date: '6h ago',
    status: 'success',
  },
];

export default function Dashboard() {
  const [requestInput, setRequestInput] = useState('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the request submission
    console.log('Lead type requested:', requestInput);
    setRequestInput('');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your speaking opportunities and engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-6 h-6 text-gray-400" />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 ml-1" />
                )}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Unlocks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Unlocks</h2>
          <div className="space-y-4">
            {recentUnlocks.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                  <p className="text-xs text-gray-500">{activity.type}</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full mr-2 bg-green-400" />
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Industry Distribution</h2>
          <div className="space-y-4">
            {[
              { name: 'Technology', percentage: 45 },
              { name: 'Finance', percentage: 25 },
              { name: 'Healthcare', percentage: 20 },
              { name: 'Education', percentage: 10 },
            ].map((industry) => (
              <div key={industry.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{industry.name}</span>
                  <span className="text-gray-900 font-medium">{industry.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${industry.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Lead Type */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Request Lead Type</h2>
          <p className="text-sm text-gray-600 mb-4">
            Help us improve! Let us know what kind of engagements you're looking for.
          </p>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <textarea
                value={requestInput}
                onChange={(e) => setRequestInput(e.target.value)}
                placeholder="Describe the type of leads you're looking for..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}