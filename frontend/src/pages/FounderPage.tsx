import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon, SparklesIcon, CalendarIcon, MapPinIcon, HeartIcon, TagIcon, GiftIcon } from '@heroicons/react/24/outline';

const FounderPage: React.FC = () => {
  const links = [
    {
      label: 'CodeBuddy从0-1入门指南',
      href: 'https://bcnbnu33v8z1.feishu.cn/wiki/WqAHwJj1oiTiFKknp5jcPFdMn3g?chunked=false'
    },
    {
      label: '了解小虎的万字长文',
      href: 'https://mp.weixin.qq.com/s/s51ogfk8VrLl2y56rg6fYw'
    }
  ];

  const basics = [
    { icon: '【昵称】', text: '小虎' },
    { icon: '【坐标】', text: '杭州' },
    { icon: '【爱好】', text: 'AI，学习，电影，旅游，唱歌' }
  ];

  const tags = [
    'AI讲师', '浙江大学计算机本硕', '专注AI编程',
    'AI破局行动家', '小虎AI赋能中心主理人',
    '13年老公益人', '联会认证讲师'
  ];

  const vision = '帮助10万人用AI打造IP超级个体，帮助1万企业用AI拿到结果，打造温馨温暖的学习圈子。';

  const milestones = [
    { title: '公众号百天万粉', desc: '第2个月开始变现5w+' }
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 border border-amber-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center space-x-4 mb-6">
            <img src="/logo-xiaohu.png" alt="小虎logo" className="w-12 h-12 rounded-lg border border-amber-300 bg-white" />
            <h1 className="text-4xl font-bold text-amber-800">创始人小虎</h1>
          </div>
          <p className="text-amber-700">
            AI讲师 | 浙大计算机本硕 | 专注AI编程
          </p>
        </div>
      </section>

      {/* 基本信息 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {basics.map((b, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <div className="flex items-center space-x-2 text-amber-700 font-medium mb-2">
              {b.icon.includes('昵称') && <SparklesIcon className="w-5 h-5" />}
              {b.icon.includes('坐标') && <MapPinIcon className="w-5 h-5" />}
              {b.icon.includes('爱好') && <HeartIcon className="w-5 h-5" />}
              <span>{b.icon}</span>
            </div>
            <div className="text-gray-800">{b.text}</div>
          </div>
        ))}
      </section>

      {/* 标签 */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <div className="flex items-center space-x-2 mb-4 text-amber-700">
          <TagIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold">标签</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span key={i} className="px-3 py-1 rounded-full text-sm bg-amber-50 text-amber-700 border border-amber-200">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* 愿景 */}
      <section className="rounded-2xl bg-amber-50 border border-amber-200 p-8">
        <div className="flex items-center space-x-2 mb-3 text-amber-700">
          <SparklesIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold">愿景</h2>
        </div>
        <p className="text-amber-900 text-lg leading-relaxed">{vision}</p>
      </section>

      {/* 里程碑 */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <div className="flex items-center space-x-2 mb-4 text-amber-700">
          <CalendarIcon className="w-5 h-5" />
          <h2 className="text-xl font-semibold">里程碑</h2>
        </div>
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={i} className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
              <p className="font-semibold text-amber-900">{m.title}</p>
              <p className="text-amber-800">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 见面礼 */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-100 to-orange-100 border border-amber-200 p-8">
        <div className="flex items-center space-x-2 mb-3 text-amber-800">
          <GiftIcon className="w-6 h-6" />
          <h2 className="text-xl font-semibold">见面礼</h2>
        </div>
        <div className="space-y-2">
          <a
            href="https://bcnbnu33v8z1.feishu.cn/wiki/WqAHwJj1oiTiFKknp5jcPFdMn3g?chunked=false"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium"
          >
            CodeBuddy从0-1入门指南
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
      </section>

      {/* 社交与内容 */}
      <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">社交与内容</h2>
        <ul className="space-y-2 text-gray-800">
          <li>#公众号：小虎AI生活</li>
          <li>#视频号：小虎AI生活</li>
          <li>朋友圈干货不少，可以经常翻翻看，有需要可以来找我聊～</li>
        </ul>
        <div className="mt-4">
          <a
            href="https://mp.weixin.qq.com/s/s51ogfk8VrLl2y56rg6fYw"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium"
          >
            了解小虎可以看这篇万字长文
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
      </section>

      {/* 页底 CTA */}
      <section className="text-center">
        <div className="inline-flex gap-3">
          <Link to="/works" className="px-6 py-3 rounded-lg bg-amber-600 text-white hover:bg-amber-700">浏览作品</Link>
          <Link to="/upload" className="px-6 py-3 rounded-lg border border-amber-600 text-amber-700 hover:bg-amber-50">上传作品</Link>
        </div>
      </section>
    </div>
  );
};

export default FounderPage;