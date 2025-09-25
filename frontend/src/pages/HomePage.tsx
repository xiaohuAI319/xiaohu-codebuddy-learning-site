import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, StarIcon, UsersIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const features = [
    {
      icon: AcademicCapIcon,
      title: '学习成长',
      description: '通过AI编程训练营，快速提升编程技能，掌握前沿技术'
    },
    {
      icon: UsersIcon,
      title: '社区互动',
      description: '与50+学员一起学习交流，分享经验，共同进步'
    },
    {
      icon: StarIcon,
      title: '作品展示',
      description: '展示你的AI编程作品，获得社区认可和投票支持'
    }
  ];

  const stats = [
    { label: '学员数量', value: '50+' },
    { label: '优秀作品', value: '100+' },
    { label: '训练营期数', value: '3+' },
    { label: '技术栈', value: '10+' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            欢迎来到
            <span className="text-blue-600 block mt-2">小虎CodeBuddy学习站</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            这里是AI编程学习者的聚集地，展示优秀作品，分享学习心得，
            <br />
            与志同道合的伙伴一起探索AI编程的无限可能
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/works"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              浏览作品
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              了解会员体系
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">为什么选择我们</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们致力于为AI编程学习者提供最好的学习环境和展示平台
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">关于小虎AI赋能中心</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                小虎AI赋能中心致力于帮助更多人掌握AI编程技能，通过系统化的训练营课程、
                实战项目练习和社区互动，让每个学员都能在AI时代找到自己的位置。
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                我们相信，通过AI工具的赋能，每个人都可以成为优秀的程序员，
                创造出令人惊叹的作品，实现自己的技术梦想。
              </p>
              <Link
                to="/works"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700"
              >
                查看学员作品
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">创始人小虎</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                资深AI技术专家，拥有10年+软件开发经验，专注于AI编程教育和技术普及。
                致力于通过简单易懂的方式，让更多人享受到AI技术带来的便利。
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>• AI编程导师</span>
                <span>• 技术布道师</span>
                <span>• 开源贡献者</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">准备好开始你的AI编程之旅了吗？</h2>
          <p className="text-gray-600 mb-8">
            加入我们的学习社区，与优秀的学员一起成长，展示你的作品，获得认可
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                立即注册
              </Link>
            ) : (
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                上传作品
              </Link>
            )}
            <Link
              to="/works"
              className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              浏览作品
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;