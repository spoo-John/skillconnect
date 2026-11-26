import { Seo } from '../components/Seo'
import { CONTACT_EMAIL } from '../seo'
import styles from './PrivacyPage.module.css'

const UPDATED = '8 November 2026'

export function PrivacyPage() {
  return (
    <article className={`container ${styles.page}`}>
      <Seo page="privacy" />
      <h1>Privacy policy</h1>
      <p className={styles.updated}>Last updated {UPDATED}</p>

      <p>
        SkillConnect connects people who need tech work done with professionals who do it. This page explains what we
        collect to make that work, and what you can ask us to do with it.
      </p>

      <h2>What we collect</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Name, email, password, account type</td>
            <td>To create your account and let you log in.</td>
          </tr>
          <tr>
            <td>Skills, bio, portfolio link (professionals)</td>
            <td>Shown on your public profile so clients can find you.</td>
          </tr>
          <tr>
            <td>Needs you post: title, description, skill, deadline, budget</td>
            <td>Shown to professionals on SkillConnect so they can respond.</td>
          </tr>
          <tr>
            <td>Messages</td>
            <td>Delivered to the person you write to and kept so you both can read the conversation.</td>
          </tr>
          <tr>
            <td>Anonymous usage: pages visited, referrer, country, device type</td>
            <td>To understand which pages help people. See Analytics below.</td>
          </tr>
        </tbody>
      </table>

      <h2>What is public</h2>
      <p>
        Your name, skills, bio and portfolio link are visible to anyone if you sign up as a professional. Your email
        address, password and messages are never shown publicly.
      </p>

      <h2>Analytics</h2>
      <p>
        We use <a href="https://plausible.io/data-policy" target="_blank" rel="noopener noreferrer">Plausible Analytics</a>,
        which sets no cookies and collects no personal data. Visits are counted in aggregate; we cannot identify you from
        them.
      </p>

      <h2>Cookies and storage</h2>
      <p>
        We set no tracking cookies. When you log in, your browser stores a sign-in token in local storage so you stay
        logged in. Signing out removes it.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We do not sell your data. It is processed by the services that run SkillConnect: our hosting providers (for the
        website and the database) and Plausible (for anonymous analytics).
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your account, needs and messages while your account is open. When you ask us to delete your account, we
        delete it and the data linked to it within 30 days, unless the law requires us to keep it longer.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct, export or delete your data, or object to how we use it. Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on your account and we will reply within
        30 days. You may also complain to your local data-protection authority — in Kenya, the Office of the Data
        Protection Commissioner.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, tell you by email.</p>
    </article>
  )
}

export default PrivacyPage
