export const getIconProps = (isActive: boolean = false) => {
  return {
    className: `w-5 h-5 transition-colors ${
      isActive ? 'text-black' : 'text-gray-400 hover:text-black'
    }`,
    strokeWidth: 1.5
  };
};
