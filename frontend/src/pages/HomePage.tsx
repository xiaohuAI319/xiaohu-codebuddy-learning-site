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
            <span className="text-blue-600 block mt-2">小虎AI编程学习站</span>
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
              to="/founder"
              className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              了解创始人小虎
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