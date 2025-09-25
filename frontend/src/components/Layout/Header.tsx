import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-primary-800 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">小</span>
              </div>
              <h1 className="text-xl font-bold">小虎CodeBuddy学习站</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/upload" 
              className="btn-primary bg-primary-600 hover:bg-primary-700"
            >
              上传作品
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">用</span>
              </div>
              <span className="text-sm">游客</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;