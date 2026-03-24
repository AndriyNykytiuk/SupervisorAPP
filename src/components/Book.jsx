import React from 'react'
import '../scss/literature.scss'

const Book = ({ book }) => {
    return (
        <div className='book-item'>
            <div className='book-pict'>
                <img src={book.image} alt="" />
                <div className='book-description'>
                    <p>{book.description}</p>
                </div>
            </div>
            <div className='book-link'>
                <a href={book.link}><h2>{book.title}</h2></a>
            </div>
        </div>
    )
}

export default Book