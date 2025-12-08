const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 p-4 text-center text-gray-700 dark:text-gray-300 mt-8">
      &copy; {new Date().getFullYear()} FSKSwap. All rights reserved.
    </footer>
  );
};

export default Footer;
