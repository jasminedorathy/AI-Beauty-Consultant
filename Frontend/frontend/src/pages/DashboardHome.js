import { Link } from 'react-router-dom';
import { FaCamera, FaMagic, FaCut, FaPaintBrush, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const DashboardHome = () => {
  // Recent Analysis Data
  const recentAnalyses = [
    { date: '2 days ago', skinType: 'Combination', concerns: ['Dark Spots', 'Fine Lines'], status: 'completed' },
    { date: '1 week ago', skinType: 'Oily', concerns: ['Acne', 'Large Pores'], status: 'completed' },
    { date: '2 weeks ago', skinType: 'Dry', concerns: ['Dehydration'], status: 'completed' },
  ];

  // Skin Health Insights
  const skinInsights = [
    {
      title: 'Hydration Level',
      value: 'Good',
      percentage: 75,
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      icon: <FaCheckCircle />
    },
    {
      title: 'Sun Protection',
      value: 'Needs Attention',
      percentage: 45,
      trend: 'down',
      color: 'from-orange-500 to-yellow-500',
      icon: <FaExclamationTriangle />
    },
    {
      title: 'Skin Texture',
      value: 'Excellent',
      percentage: 92,
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      icon: <FaCheckCircle />
    },
  ];

  const quickActions = [
    {
      title: 'Face Analysis',
      desc: 'Upload a photo for instant skin analysis',
      icon: <FaMagic className="text-4xl" />,
      link: '/dashboard/analyze',
      gradient: 'from-purple-600 to-teal-600',
      badge: 'Popular'
    },
    {
      title: 'Live Camera',
      desc: 'Real-time face analysis with your webcam',
      icon: <FaCamera className="text-4xl" />,
      link: '/dashboard/live',
      gradient: 'from-blue-600 to-cyan-600',
      badge: 'New'
    },
    {
      title: 'Hair Styling',
      desc: 'Get personalized hairstyle recommendations',
      icon: <FaCut className="text-4xl" />,
      link: '/dashboard/hair',
      gradient: 'from-orange-600 to-red-600',
    },
    {
      title: 'Nail Studio',
      desc: 'Discover nail art that matches your style',
      icon: <FaPaintBrush className="text-4xl" />,
      link: '/dashboard/nails',
      gradient: 'from-teal-600 to-cyan-600',
      badge: 'New'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-8 rounded-3xl">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Your personalized AI-powered beauty consultant is ready to help you achieve your best look.
        </p>
      </div>

      {/* Skin Health Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaChartLine className="text-purple-600" />
          Your Skin Health Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skinInsights.map((insight, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${insight.color} text-white text-xl`}>
                  {insight.icon}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${insight.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {insight.trend === 'up' ? '↑ Improving' : '↓ Attention'}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">{insight.title}</h3>
              <p className="text-2xl font-bold text-gray-800 mb-3">{insight.value}</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${insight.color} transition-all duration-500`}
                  style={{ width: `${insight.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{insight.percentage}% Optimal</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className="glass-card p-6 rounded-2xl card-hover group relative overflow-hidden"
            >
              {/* Badge */}
              {action.badge && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  {action.badge}
                </span>
              )}

              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.desc}</p>

              {/* Hover Arrow */}
              <div className="mt-4 flex items-center text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="glass-card p-8 rounded-3xl bg-gradient-to-r from-purple-50 to-teal-50">
        <div className="flex items-center gap-2 mb-4">
          <FaInfoCircle className="text-purple-600 text-2xl" />
          <h2 className="text-2xl font-bold text-gray-800">Personalized Tips for You</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex gap-3 p-4 bg-white/60 rounded-xl">
            <div className="text-2xl">💧</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Boost Hydration</h4>
              <p className="text-sm text-gray-600">Your skin shows signs of dehydration. Use a hyaluronic acid serum daily.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-white/60 rounded-xl">
            <div className="text-2xl">☀️</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">SPF Protection</h4>
              <p className="text-sm text-gray-600">Apply SPF 50+ sunscreen every morning to prevent sun damage and dark spots.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-white/60 rounded-xl">
            <div className="text-2xl">🌙</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Night Routine</h4>
              <p className="text-sm text-gray-600">Add a retinol treatment 2-3 times per week to improve skin texture.</p>
            </div>
          </div>
          <div className="flex gap-3 p-4 bg-white/60 rounded-xl">
            <div className="text-2xl">🥗</div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Nutrition Matters</h4>
              <p className="text-sm text-gray-600">Increase vitamin C intake through citrus fruits for brighter, healthier skin.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Recent Analyses</h2>
          <Link to="/dashboard/history" className="text-purple-600 hover:text-teal-600 font-semibold text-sm flex items-center gap-1 transition-colors">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid gap-4">
          {recentAnalyses.map((analysis, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <FaMagic className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{analysis.skinType} Skin Analysis</p>
                  <p className="text-sm text-gray-500">{analysis.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {analysis.concerns.map((concern, i) => (
                    <span key={i} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                      {concern}
                    </span>
                  ))}
                </div>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
