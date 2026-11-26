import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './Avatar'
import { Logo } from './Logo'
import styles from './Navbar.module.css'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)

  // On the home page the bar is transparent over the hero photo until the page scrolls.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const overlay = location.pathname === '/' && !scrolled && !menuOpen

  // Any navigation closes open menus.
  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!menuOpen && !accountOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setAccountOpen(false)
      }
    }
    function onClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [menuOpen, accountOpen])

  function signOut() {
    logout()
    navigate('/')
  }

  const links = user
    ? [
        { to: '/browse', label: 'Browse' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/messages', label: 'Messages' },
      ]
    : [{ to: '/browse', label: 'Browse' }]

  return (
    <header className={styles.header} data-overlay={overlay || undefined}>
      <nav className={`container ${styles.nav}`} aria-label="Main">
        <Link to="/" className={styles.brand} aria-label="SkillConnect home">
          <Logo />
        </Link>

        <div className={styles.links}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link to="/post-need" className={`btn btn-primary btn-sm ${styles.cta}`}>
                Post a need
              </Link>
              <div className={styles.account} ref={accountRef}>
                <button
                  type="button"
                  className={styles.avatarBtn}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-label="Account menu"
                  onClick={() => setAccountOpen((v) => !v)}
                >
                  <Avatar name={user.name} id={user.id} size={30} />
                </button>
                {accountOpen && (
                  <div className={`${styles.dropdown} fade-in`} role="menu">
                    <div className={styles.who}>
                      <div className={styles.whoName}>{user.name}</div>
                      {user.email && <div className={styles.whoEmail}>{user.email}</div>}
                    </div>
                    <Link role="menuitem" to="/profile" className={styles.item}>
                      Your profile
                    </Link>
                    <Link role="menuitem" to="/privacy" className={styles.item}>
                      Privacy
                    </Link>
                    <button role="menuitem" type="button" className={styles.item} onClick={signOut}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-ghost btn-sm ${styles.login}`}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            className={styles.menuBtn}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {menuOpen ? (
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5.5h13M2.5 12.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className={`${styles.sheet} fade-in`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `${styles.sheetLink} ${isActive ? styles.active : ''}`}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/post-need" className={styles.sheetLink}>
                Post a need
              </NavLink>
              <NavLink to="/profile" className={styles.sheetLink}>
                Your profile
              </NavLink>
              <button type="button" className={styles.sheetLink} onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={styles.sheetLink}>
              Log in
            </NavLink>
          )}
        </div>
      )}
    </header>
  )
}
