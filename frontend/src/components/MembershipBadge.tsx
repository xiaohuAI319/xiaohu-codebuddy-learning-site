import React from 'react';

interface MembershipBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const MembershipBadge: React.FC<MembershipBadgeProps> = ({ 
  level, 
  size = 'md', 
  showIcon = true 
}) => {
  const getLevelConfig = (level: string) => {
    const configs = {
      '学员': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '🎓',
        gradient: 'from-gray-400 to-gray-600'
      },
      '会员': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '💎',
        gradient: 'from-blue-400 to-blue-600'
      },
      '高级会员': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '👑',
        gradient: 'from-purple-400 to-purple-600'
      },
      '共创': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '🤝',
        gradient: 'from-yellow-400 to-yellow-600'
      },
      '讲师': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🏆',
        gradient: 'from-red-400 to-red-600'
      }
    };
    return configs[level as keyof typeof configs] || configs['学员'];
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[size as keyof typeof sizes];
  };

  const config = getLevelConfig(level);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${config.color} ${sizeClasses}
    `}>
      {showIcon && <span>{config.icon}</span>}
      {level}
    </span>
  );
};

export default MembershipBadge;