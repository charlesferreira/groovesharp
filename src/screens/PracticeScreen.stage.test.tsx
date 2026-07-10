import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { LocalPractice as App } from './LocalPractice'

beforeEach(() => localStorage.clear())

test('modo palco mostra a música atual e navega', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /Charlie Brown Jr\./ }))
  await user.click(screen.getByRole('button', { name: /Modo palco/ }))

  expect(screen.getByText('1 / 38')).toBeInTheDocument()
  expect(screen.getByText(/A seguir:/)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Próxima/ }))
  expect(screen.getByText('2 / 38')).toBeInTheDocument()
})
