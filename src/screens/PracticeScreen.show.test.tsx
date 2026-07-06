import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { PracticeScreen as App } from './PracticeScreen'

beforeEach(() => localStorage.clear())

test('define a data do show e mostra a prontidão', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByRole('button', { name: /Definir data do show/ }))
  fireEvent.change(screen.getByLabelText('Data do show'), { target: { value: '2026-12-31' } })
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(screen.getByText(/Próximo show/)).toBeInTheDocument()
  expect(screen.getByText(/Prontidão projetada/)).toBeInTheDocument()
})
