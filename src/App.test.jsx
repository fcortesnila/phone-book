import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'

function renderApp() {
  return render(<App />)
}

describe('phone book', () => {
  it('filters contacts by name and phone number', async () => {
    const user = userEvent.setup()
    renderApp()

    const search = screen.getByRole('textbox', { name: 'Search contacts' })
    await user.type(search, 'phoenix')
    expect(screen.getByRole('heading', { name: 'Phoenix Baker' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Olivia Rhye' })).not.toBeInTheDocument()

    await user.clear(search)
    await user.type(search, '555-0132')
    expect(screen.getByRole('heading', { name: 'Olivia Rhye' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Phoenix Baker' })).not.toBeInTheDocument()
  })

  it('shows an empty state when no contacts match', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.type(screen.getByRole('textbox', { name: 'Search contacts' }), 'nobody matches this')

    expect(screen.getByRole('heading', { name: 'No contacts found' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Olivia Rhye' })).not.toBeInTheDocument()
  })

  it('adds a contact with synthetic details', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))
    expect(screen.getByLabelText('First name')).toHaveFocus()
    await user.type(screen.getByLabelText('First name'), 'Taylor')
    await user.type(screen.getByLabelText('Last name'), 'Jordan')
    await user.type(screen.getByLabelText('Phone number'), '(555) 010-2040')
    await user.type(screen.getByLabelText(/Email address/), 'taylor.jordan@example.test')
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))

    expect(screen.getByRole('heading', { name: 'Taylor Jordan' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '(555) 010-2040' })).toBeInTheDocument()
    expect(screen.getByText('taylor.jordan@example.test')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Taylor Jordan added.')
    expect(screen.getByRole('heading', { name: 'Your contacts' })).toHaveFocus()
  })

  it('edits an existing contact', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Edit Olivia Rhye' }))
    expect(screen.getByLabelText('First name')).toHaveFocus()

    const firstName = screen.getByLabelText('First name')
    await user.clear(firstName)
    await user.type(firstName, 'Olivia-Rose')
    await user.clear(screen.getByLabelText('Phone number'))
    await user.type(screen.getByLabelText('Phone number'), '(555) 010-8899')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('heading', { name: 'Olivia-Rose Rhye' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '(555) 010-8899' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Olivia Rhye' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Your contacts' })).toHaveFocus()
  })

  it('does not submit when required input is empty', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))
    const firstName = screen.getByLabelText('First name')
    await user.type(screen.getByLabelText('Last name'), 'Jordan')
    await user.type(screen.getByLabelText('Phone number'), '(555) 010-2040')
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))

    expect(firstName).toBeRequired()
    expect(firstName).toBeInvalid()
    expect(screen.getByRole('heading', { name: 'Add a contact' })).toBeInTheDocument()
  })

  it('restores a saved contact after the app is mounted again', async () => {
    const user = userEvent.setup()
    const app = renderApp()
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))
    await user.type(screen.getByLabelText('First name'), 'Casey')
    await user.type(screen.getByLabelText('Last name'), 'Nguyen')
    await user.type(screen.getByLabelText('Phone number'), '(555) 010-3200')
    await user.click(screen.getByRole('button', { name: 'Add contact', exact: true }))

    await waitFor(() => expect(JSON.parse(localStorage.getItem('phone-book-contacts'))).toEqual(expect.arrayContaining([
      expect.objectContaining({ firstName: 'Casey', lastName: 'Nguyen', phone: '(555) 010-3200' }),
    ])))
    app.unmount()
    renderApp()

    expect(screen.getByRole('heading', { name: 'Casey Nguyen' })).toBeInTheDocument()
  })

  it('shows initials if a profile photo fails to load', () => {
    const { container } = renderApp()
    const avatar = container.querySelector('img[src="https://i.pravatar.cc/160?img=47"]')
    expect(avatar).toHaveAttribute('alt', '')

    fireEvent.error(avatar)

    expect(container.querySelector('img[src="https://i.pravatar.cc/160?img=47"]')).not.toBeInTheDocument()
    expect(screen.getByText('OR')).toHaveAttribute('aria-hidden', 'true')
  })

  it('asks for confirmation before deleting and restores focus when cancelled', async () => {
    const user = userEvent.setup()
    renderApp()
    const deleteButton = screen.getByRole('button', { name: 'Delete Olivia Rhye' })
    await user.click(deleteButton)

    const dialog = screen.getByRole('alertdialog', { name: 'Delete Olivia Rhye?' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAccessibleDescription('This contact will be removed from your phone book. This action cannot be undone.')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    expect(screen.getByRole('heading', { name: 'Olivia Rhye' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Olivia Rhye' })).toBeInTheDocument()
    expect(deleteButton).toHaveFocus()
  })

  it('deletes the confirmed contact, persists the change, and reports success', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Delete Olivia Rhye' }))
    await user.click(screen.getByRole('button', { name: 'Delete contact' }))

    expect(screen.queryByRole('heading', { name: 'Olivia Rhye' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Changes saved on this device.')
    expect(JSON.parse(localStorage.getItem('phone-book-contacts'))).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ firstName: 'Olivia', lastName: 'Rhye' }),
    ]))
    expect(screen.getByRole('button', { name: 'Add contact', exact: true })).toHaveFocus()
  })

  it('closes the confirmation dialog with Escape and keeps the contact', async () => {
    const user = userEvent.setup()
    renderApp()
    const deleteButton = screen.getByRole('button', { name: 'Delete Olivia Rhye' })
    await user.click(deleteButton)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Olivia Rhye' })).toBeInTheDocument()
    expect(deleteButton).toHaveFocus()
  })

  it('keeps keyboard focus inside the delete confirmation dialog', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Delete Olivia Rhye' }))
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const confirmButton = screen.getByRole('button', { name: 'Delete contact' })

    expect(cancelButton).toHaveFocus()
    await user.tab()
    expect(confirmButton).toHaveFocus()
    await user.tab()
    expect(cancelButton).toHaveFocus()
    await user.tab({ shift: true })
    expect(confirmButton).toHaveFocus()
  })

  it('reports an error if deleting cannot be saved to this device', async () => {
    const user = userEvent.setup()
    renderApp()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable')
    })
    await user.click(screen.getByRole('button', { name: 'Delete Olivia Rhye' }))
    await user.click(screen.getByRole('button', { name: 'Delete contact' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Could not save changes on this device.')
    expect(screen.queryByRole('heading', { name: 'Olivia Rhye' })).not.toBeInTheDocument()
  })
})

