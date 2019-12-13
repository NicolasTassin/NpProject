import React, { Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { isAuth, signout } from '../auth/helpers'


const Layout = ({ children, match, history }) => {
    const isActive = path => {
        if (match.path === path) {
            return { color: '#000' }
        } else {
            return { color: '#fff' }
        }
    }
    const nav = () => (
        <ul className='nav nav-tabs bg-primary'>
            <li className="nav-items">
                <Link to="/" className="nav-link" style={isActive('/')}>
                    Home
                </Link>
            </li>

            {!isAuth() && (
                <Fragment>
                    <li className="nav-items">
                        <Link to="/signin" className="nav-link" style={isActive('/signin')}>
                            SignIn
                </Link>
                    </li>
                    <li className="nav-items">
                        <Link to="/signup" className="nav-link" style={isActive('/signup')}>
                            Signup
                </Link>
                    </li>
                </Fragment>
            )}



            {isAuth() && (
                <li className="nav-items">
                    <span className="nav-link">{isAuth().name}</span>

                </li>
            )}



            {isAuth() && (

                <li className="nav-items">
                    <span className="nav-link"
                        style={{ cursor: 'pointer', color: 'white' }}
                        onClick={() => {
                            signout(() => {
                                history.push('/')
                            })
                        }}>SignOut</span>
                </li>
            )}


        </ul>
    );
    return (
        <Fragment>
            {nav()}
            <div className="container">{children}</div>
        </Fragment>
    )
}


export default withRouter(Layout)