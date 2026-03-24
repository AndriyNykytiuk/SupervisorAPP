import React from 'react'
import Book from '../components/Book.jsx'
import '../scss/literature.scss'
import { books } from '../../BooksPathes.js'
import cfbt from '../assets/cfbtLogo.png'

const Literature = () => {
    return (
        <div>
            <h2 className='gd-title-wrapp'>Compartment Fire Behaviour Training in Ukraine</h2>
            <div className='cfbt-wrapp'>
                <a href="https://cfbt.pl/" target='_blank'>
                    <img src={cfbt} alt="CFBT Logo"/>
                </a>
                <p>
                    CFBT - це загальновживана міжнародна абревіатура Compartment Fire Behaviour Training, описуючи коротко це тренування пожежогасінню в приміщеннях. 
                    Цей вид підготовки поєднує усі методи підготовки та тренувань, які використовуються для підготовки до гасіння внутрішніх пожеж. 
                    CFBT це також міжнародний спосіб навчання. 
                </p>
            </div>
            <div className='gd-item-wrapp book-wrapp'>
                {books.map((book) => (
                    <Book key={book.id} book={book} />
                ))}
            </div>
        </div>
    )
}

export default Literature