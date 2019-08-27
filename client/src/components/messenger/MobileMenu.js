import React from 'react';
import { Col } from 'reactstrap';

const MobileMenu = ({toggle_profile_modal, changeView}) => {

    return(<div>
        <Col className="d-block d-md-none">
            <nav className="navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
                <img src='/img/friends.png' className='mx-auto' width='40' height='40' alt='friends' onClick={() => changeView('friends')} />
                <img src='/img/conversation.png' className='mx-auto' width='40' height='40' alt='conversation' onClick={() => changeView('conversation')} />
                <img src='/img/profile.png' className='mx-auto' width='40' height='40' alt='profile' onClick={toggle_profile_modal} />
             </nav>
        </Col>
    </div>)
}

export default MobileMenu;