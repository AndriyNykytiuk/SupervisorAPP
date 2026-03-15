
import React from 'react'
import '../scss/testorderschedulecomponent.scss'

const Testorderschedulelinks = ({ links }) => {
    return (
        <div className='paper-wrap'>

            <div>
                <a href={links?.linkSchedule || "#"} target="_blank" rel="noreferrer">Графік випробувань</a>
            </div>
            <div>
                <a href={links?.linkOrder || "#"} target="_blank" rel="noreferrer">Наказ на Випробування</a>
            </div>

        </div>
    )
}

export default Testorderschedulelinks

