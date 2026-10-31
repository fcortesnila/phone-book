import { useEffect, useMemo, useState } from 'react'

const initialContacts = [
  { id: 1, firstName: 'Olivia', lastName: 'Rhye', phone: '(415) 555-0132', email: 'olivia.rhye@example.com', image: 'https://i.pravatar.cc/160?img=47' },
  { id: 2, firstName: 'Phoenix', lastName: 'Baker', phone: '(415) 555-0184', email: 'phoenix.baker@example.com', image: 'https://i.pravatar.cc/160?img=12' },
  { id: 3, firstName: 'Lana', lastName: 'Steiner', phone: '(415) 555-0167', email: 'lana.steiner@example.com', image: 'https://i.pravatar.cc/160?img=44' },
  { id: 4, firstName: 'Demi', lastName: 'Wilkinson', phone: '(415) 555-0191', email: 'demi.wilkinson@example.com', image: 'https://i.pravatar.cc/160?img=32' },
  { id: 5, firstName: 'Candice', lastName: 'Wu', phone: '(415) 555-0128', email: 'candice.wu@example.com', image: 'https://i.pravatar.cc/160?img=49' },
  { id: 6, firstName: 'Natali', lastName: 'Craig', phone: '(415) 555-0175', email: 'natali.craig@example.com', image: 'https://i.pravatar.cc/160?img=25' },
]

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
  if (name === 'edit') return <svg {...common}><path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></svg>
  if (name === 'phone') return <svg {...common}><path d="M7 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-7-7l3-2z" /></svg>
  if (name === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
  if (name === 'back') return <svg {...common}><path d="m15 18-6-6 6-6M9 12h12" /></svg>
  return null
}

function ContactAvatar({ contact, large = false }) {
  const [failed, setFailed] = useState(false)
  const initials = `${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`.toUpperCase()
  return contact.image && !failed
    ? <img className={`avatar ${large ? 'avatar-large' : ''}`} src={contact.image} alt={`${contact.firstName} ${contact.lastName}`} onError={() => setFailed(true)} />
    : <span className={`avatar avatar-fallback ${large ? 'avatar-large' : ''}`} aria-label={`${contact.firstName} ${contact.lastName}`}>{initials || '?'}</span>
}

function App() {
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('phone-book-contacts')) ?? initialContacts } catch { return initialContacts }
  })
  const [query, setQuery] = useState('')
  const [page, setPage] = useState({ type: 'list' })

  useEffect(() => localStorage.setItem('phone-book-contacts', JSON.stringify(contacts)), [contacts])

  const filteredContacts = useMemo(() => contacts
    .filter((contact) => `${contact.firstName} ${contact.lastName} ${contact.phone}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)), [contacts, query])

  function saveContact(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const contact = {
      id: page.contact?.id ?? Date.now(),
      firstName: form.get('firstName').trim(),
      lastName: form.get('lastName').trim(),
      phone: form.get('phone').trim(),
      email: form.get('email').trim(),
      image: form.get('image').trim(),
    }
    setContacts((current) => page.contact ? current.map((item) => item.id === contact.id ? contact : item) : [...current, contact])
    setPage({ type: 'list' })
  }

  const isForm = page.type === 'add' || page.type === 'edit'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); setPage({ type: 'list' }) }}>
          <span className="brand-mark"><Icon name="phone" size={20} /></span>
          <span>phonebook<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> Your personal contacts</div>
      </header>

      {isForm ? (
        <main className="form-page">
          <button className="back-link" onClick={() => setPage({ type: 'list' })}><Icon name="back" size={17} /> Back to contacts</button>
          <div className="form-heading">
            <div className="form-avatar"><ContactAvatar contact={page.contact ?? { firstName: '', lastName: '', image: '' }} large /></div>
            <div><p className="eyebrow">CONTACT DETAILS</p><h1>{page.type === 'edit' ? 'Edit contact' : 'Add a contact'}</h1><p className="subheading">{page.type === 'edit' ? 'Update the details for this person.' : 'Save someone new to your phone book.'}</p></div>
          </div>
          <form className="contact-form" onSubmit={saveContact}>
            <div className="field-row">
              <label>First name<input autoFocus name="firstName" placeholder="e.g. Alex" defaultValue={page.contact?.firstName ?? ''} required /></label>
              <label>Last name<input name="lastName" placeholder="e.g. Morgan" defaultValue={page.contact?.lastName ?? ''} required /></label>
            </div>
            <label>Phone number<div className="input-with-icon"><Icon name="phone" size={17} /><input name="phone" type="tel" placeholder="(555) 000-0000" defaultValue={page.contact?.phone ?? ''} required /></div></label>
            <label>Email address <span className="optional">OPTIONAL</span><div className="input-with-icon"><Icon name="mail" size={17} /><input name="email" type="email" placeholder="name@example.com" defaultValue={page.contact?.email ?? ''} /></div></label>
            <label>Profile photo URL <span className="optional">OPTIONAL</span><input name="image" type="url" placeholder="https://example.com/photo.jpg" defaultValue={page.contact?.image ?? ''} /></label>
            <div className="form-actions"><button type="button" className="button button-quiet" onClick={() => setPage({ type: 'list' })}>Cancel</button><button className="button button-primary" type="submit">{page.type === 'edit' ? 'Save changes' : 'Add contact'}</button></div>
          </form>
        </main>
      ) : (
        <main className="directory-page">
          <section className="welcome-row">
            <div><p className="eyebrow">YOUR DIRECTORY</p><h1>All your people,<br className="mobile-break" /> in one place.</h1><p className="subheading">A little easier to stay in touch.</p></div>
            <button className="button button-primary add-button" onClick={() => setPage({ type: 'add' })}><Icon name="plus" size={18} /> Add contact</button>
          </section>
          <section className="directory-card">
            <div className="directory-toolbar"><div><h2>Your contacts</h2><p>{contacts.length} {contacts.length === 1 ? 'person' : 'people'} in your phone book</p></div><label className="search-box"><Icon name="search" size={18} /><input aria-label="Search contacts" placeholder="Search contacts" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery('')} type="button">×</button>}</label></div>
            {filteredContacts.length ? <div className="contact-list">{filteredContacts.map((contact) => <article className="contact-row" key={contact.id}><ContactAvatar contact={contact} /><div className="contact-main"><h3>{contact.firstName} {contact.lastName}</h3><a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="contact-phone">{contact.phone}</a></div><div className="contact-email">{contact.email || <span className="muted">No email added</span>}</div><button className="icon-button" aria-label={`Edit ${contact.firstName} ${contact.lastName}`} title="Edit contact" onClick={() => setPage({ type: 'edit', contact })}><Icon name="edit" size={17} /></button></article>)}</div> : <div className="empty-state"><span className="empty-icon"><Icon name="search" size={22} /></span><h3>No contacts found</h3><p>Try a different search, or add someone new.</p><button className="button button-primary" onClick={() => setPage({ type: 'add' })}><Icon name="plus" size={17} /> Add contact</button></div>}
            <div className="directory-footer"><span><span className="status-dot" /> All changes are saved on this device</span><span>PHONE BOOK <span className="footer-dot">·</span> {String(filteredContacts.length).padStart(2, '0')} CONTACTS</span></div>
          </section>
        </main>
      )}
      <footer className="page-footer">MADE FOR THE PEOPLE YOU KEEP CLOSE <span>✳</span></footer>
    </div>
  )
}

export default App

