import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { LocalPractice as App } from './LocalPractice'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

async function openSetlistMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Charlie Brown Jr\./ }))
}

test('cria um novo setlist pelo menu', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'prompt').mockReturnValue('Show de Sexta')
  render(<App />)

  await openSetlistMenu(user)
  await user.click(screen.getByRole('button', { name: /Novo setlist/ }))

  expect(screen.getByRole('heading', { name: 'Show de Sexta' })).toBeInTheDocument()
})

test('modo edição permite adicionar uma música', async () => {
  const user = userEvent.setup()
  render(<App />)

  await openSetlistMenu(user)
  await user.click(screen.getByRole('button', { name: /Editar músicas/ }))
  await user.click(screen.getByRole('button', { name: /Adicionar música/ }))

  await user.type(screen.getByLabelText('Título'), 'Minha Música Nova')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  expect(screen.getByText('Minha Música Nova')).toBeInTheDocument()
})

test('editar uma música salva BPM e mostra o chip', async () => {
  const user = userEvent.setup()
  render(<App />)

  await openSetlistMenu(user)
  await user.click(screen.getByRole('button', { name: /Editar músicas/ }))

  const editButtons = screen.getAllByTitle('Editar')
  await user.click(editButtons[0]) // Pipeline

  await user.type(screen.getByLabelText('BPM'), '150')
  await user.click(screen.getByRole('button', { name: 'Salvar' }))

  // sai do modo edição pra ver os chips (só aparecem no modo prática)
  await openSetlistMenu(user)
  await user.click(screen.getByRole('button', { name: /Concluir edição/ }))

  expect(screen.getByText('150 BPM')).toBeInTheDocument()
})

test('remove uma música no modo edição', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  render(<App />)

  await openSetlistMenu(user)
  await user.click(screen.getByRole('button', { name: /Editar músicas/ }))

  expect(screen.getByText('Pipeline')).toBeInTheDocument()
  const removeButtons = screen.getAllByTitle('Remover')
  await user.click(removeButtons[0])

  expect(screen.queryByText('Pipeline')).not.toBeInTheDocument()
})
