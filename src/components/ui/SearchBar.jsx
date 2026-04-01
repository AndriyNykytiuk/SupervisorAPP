import React from 'react';
import '../../scss/searchbar.scss';

const SearchBar = ({ value, onChange, placeholder = 'Пошук за назвою...' }) => {
    return (
        <div className="search-bar">
            <span className="search-bar__icon">🔍</span>
            <input
                type="text"
                className="search-bar__input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
            {value && (
                <button className="search-bar__clear" onClick={() => onChange('')}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;
