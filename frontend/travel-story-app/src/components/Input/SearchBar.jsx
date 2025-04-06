import React from 'react';
import { IoSearch } from 'react-icons/io5';
import { IoMdClose } from 'react-icons/io';

const SearchBar = ({ value, onchange, handleSearch, onClickSearch}) => {
  return (
    <div className='w-80 flex items-center px-4 bg-slate-100 rounded-md'>
        <input 
            type='text'
            placeholder='Search Notes'
            className='w-full text-xs bg-transparent py-[11px] outline-none'
            value={value}
            onChange={onchange}
        />

        {
            value && <IoMdClose className='text-xl text-slate-500 cursor-pointer hover:text-black mr-3' onClick={onClickSearch} />
        }

        <IoSearch className='text-slate-400 cursor-pointer hover:text-black' onClick={handleSearch}/>
    </div>
  )
}

export default SearchBar
