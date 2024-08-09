import React from 'react';
import HeaderTitle from '../../components/headerLogo/HeaderTitle';
import SearchResultsPage from '../../components/searchComponent/SearchResultsPage';
import Footer from '../../components/footer/Footer';

const SearchPage = () => {

  return (
    <div>
        <HeaderTitle />
        <SearchResultsPage />
        <Footer />
    </div>
  );
};

export default SearchPage;