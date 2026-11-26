import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { Backdrop } from '../components/Backdrop'
import { Reveal } from '../components/Reveal'
import { Avatar } from '../components/Avatar'
import { postsApi, usersApi } from '../api/client'
import { SKILLS, skillLabel } from '../constants'
import { useCountUp, useCycle, useInView } from '../lib/motion'
import { parseSkills, type User } from '../types'
import { plural } from '../utils/helpers'
import styles from './HomePage.module.css'

const ROLES = ['tech talent', 'developers', 'designers', 'security pros', 'data analysts']

const STEPS = [
  { title: 'Post a need', body: 'Describe the job in plain words. Add a budget and deadline if you have them.' },
  { title: 'Pick a professional', body: 'Filter by skill and read profiles and portfolios.' },
  { title: 'Talk directly', body: 'Agree scope and price in messages. No agency, no fee to post.' },
]

export function HomePage() {
  const [pros, setPros] = useState<User[] | null>(null)
  const [openNeeds, setOpenNeeds] = useState<number | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    usersApi
      .list(ctrl.signal)
      .then((users) => setPros(Array.isArray(users) ? users.filter((u) => u.role !== 'client') : []))
      .catch(() => setPros(null))
    postsApi
      .list(null, ctrl.signal)
      .then((posts) => setOpenNeeds(Array.isArray(posts) ? posts.filter((p) => p.status === 'open').length : null))
      .catch(() => setOpenNeeds(null))
    return () => ctrl.abort()
  }, [])

  const newest = useMemo(() => (pros?.length ? [...pros].sort((a, b) => b.id - a.id)[0] : null), [pros])

  return (
    <>
      <Seo page="home" />

      <section className={styles.hero}>
        <Backdrop photo="teamLaptops" priority scrim="left" focus="60% 22%" />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              <span className="visually-hidden">Hire tech talent directly.</span>
              <span aria-hidden="true">
                <span className={styles.line}>Hire</span>
                <RotatingWord words={ROLES} />
                <span className={styles.line}>directly.</span>
              </span>
            </h1>
            <p className={styles.lead}>
              Post what you need, then message developers, designers and security pros. No agency in between.
            </p>
            <div className={styles.ctas}>
              <Link to="/post-need" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
                Post a need
              </Link>
              <Link to="/browse" className={`btn btn-lg ${styles.ctaGlass}`}>
                Browse professionals
              </Link>
            </div>
            <LiveStats pros={pros?.length ?? null} openNeeds={openNeeds} />
          </div>

          {newest && (
            <Link to={`/profile?id=${newest.id}`} className={styles.floatCard}>
              <Avatar name={newest.name} id={newest.id} size={36} />
              <span>
                <span className={styles.floatName}>{newest.name}</span>
                <span className={styles.floatSub}>
                  {parseSkills(newest.skills)[0] ? skillLabel(parseSkills(newest.skills)[0]) : 'Professional'} · newest member
                </span>
              </span>
            </Link>
          )}
        </div>
        <a href="#skills-heading" className={styles.scrollCue} aria-label="Scroll to skills">
          <span />
        </a>
      </section>

      {pros && pros.length >= 4 && <ProMarquee pros={pros} />}

      <section className={`container ${styles.section}`} aria-labelledby="skills-heading">
        <Reveal as="h2" className={styles.h2}>
          <span id="skills-heading">Find by skill</span>
        </Reveal>
        <ul className={styles.skills}>
          {SKILLS.map((s, i) => (
            <Reveal as="li" key={s.value} delay={i * 40}>
              <Link to={`/browse?skill=${encodeURIComponent(s.value)}`} className={styles.skill}>
                <span>{s.label}</span>
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className={`${styles.band} ${styles.bandLeft}`} aria-labelledby="how-heading">
        <Backdrop photo="teamBoard" scrim="left" focus="60% 40%" />
        <div className={`container ${styles.bandInner}`}>
          <div className={styles.bandText}>
            <Reveal as="h2" className={styles.h2}>
              <span id="how-heading">How it works</span>
            </Reveal>
            <Steps />
          </div>
        </div>
      </section>

      <section className={`${styles.band} ${styles.bandRight}`} aria-labelledby="pro-heading">
        <Backdrop photo="dashboardLaptop" scrim="right" focus="30% 50%" />
        <div className={`container ${styles.bandInner}`}>
          <div className={styles.bandText}>
            <Reveal as="h2" className={styles.h2}>
              <span id="pro-heading">Have the skills? Get found.</span>
            </Reveal>
            <Reveal as="p" delay={80} className={styles.proLead}>
              Make your profile once. Clients who need what you do message you directly, and you see open needs that
              match your skills.
            </Reveal>
            <Reveal delay={160}>
              <Link to="/register?role=professional" className={`btn btn-primary btn-lg ${styles.ctaPrimary}`}>
                Join as a professional
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}

/** The changing word in the headline. Every word is stacked in one grid cell so the line never jumps. */
function RotatingWord({ words }: { words: string[] }) {
  const index = useCycle(words.length, 2400)
  const prev = (index - 1 + words.length) % words.length
  return (
    <span className={styles.rotator}>
      {words.map((w, i) => (
        <span key={w} className={i === index ? styles.wordIn : i === prev ? styles.wordOut : styles.wordIdle}>
          {w}
        </span>
      ))}
    </span>
  )
}

function LiveStats({ pros, openNeeds }: { pros: number | null; openNeeds: number | null }) {
  const proCount = useCountUp(pros || null)
  const needCount = useCountUp(openNeeds || null)
  const parts = [proCount != null && plural(proCount, 'professional'), needCount != null && plural(needCount, 'open need')].filter(
    Boolean
  )
  return (
    <p className={styles.meta} aria-live="polite">
      {parts.length ? (
        <>
          <span className={styles.liveDot} aria-hidden="true" />
          {parts.join(' · ')} on SkillConnect
        </>
      ) : (
        ' '
      )}
    </p>
  )
}

function Steps() {
  const { ref, inView } = useInView<HTMLOListElement>()
  return (
    <ol ref={ref} className={`${styles.steps} ${inView ? styles.stepsOn : ''}`}>
      {STEPS.map((step, i) => (
        <li key={step.title} className={styles.step} style={{ transitionDelay: `${150 + i * 180}ms` }}>
          <span className={styles.stepNum}>{i + 1}</span>
          <div>
            <h3>{step.title}</h3>
            <p className="muted">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Endless strip of real professionals. The second copy exists only for the loop, so it's hidden from assistive tech. */
function ProMarquee({ pros }: { pros: User[] }) {
  const list = [...pros].sort((a, b) => b.id - a.id).slice(0, 16)
  const item = (p: User, hidden: boolean) => (
    <li key={`${hidden ? 'b' : 'a'}-${p.id}`} aria-hidden={hidden || undefined}>
      <Link to={`/profile?id=${p.id}`} className={styles.marqueeItem} tabIndex={hidden ? -1 : undefined}>
        <Avatar name={p.name} id={p.id} size={28} />
        <span className={styles.floatName}>{p.name}</span>
        <span className={styles.floatSub}>{parseSkills(p.skills)[0] ? skillLabel(parseSkills(p.skills)[0]) : 'Professional'}</span>
      </Link>
    </li>
  )
  return (
    <div className={styles.marquee}>
      <ul className={styles.marqueeTrack} aria-label="Professionals on SkillConnect" style={{ animationDuration: `${list.length * 4}s` }}>
        {list.map((p) => item(p, false))}
        {list.map((p) => item(p, true))}
      </ul>
    </div>
  )
}

export default HomePage
