import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())

test('abre em Praticar e navega entre as abas', async () => {
  const user = userEvent.setup()
  render(<App />)

  // Praticar é a aba inicial
  expect(screen.getByRole('button', { name: /Charlie Brown Jr\./ })).toBeInTheDocument()

  // Perfil — em modo local (sem backend nos testes)
  await user.click(screen.getByRole('button', { name: /Perfil/ }))
  expect(screen.getByRole('heading', { name: 'Perfil' })).toBeInTheDocument()
  expect(screen.getByText(/modo local/)).toBeInTheDocument()

  // Banda — convida a entrar
  await user.click(screen.getByRole('button', { name: /Banda/ }))
  expect(screen.getByRole('heading', { name: 'Banda' })).toBeInTheDocument()
})
