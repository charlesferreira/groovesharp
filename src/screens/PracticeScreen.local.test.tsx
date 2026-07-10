import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { LocalPractice as App } from './LocalPractice'

beforeEach(() => localStorage.clear())

test('renderiza o nome do app e o setlist padrão', () => {
  render(<App />)
  expect(screen.getByText('GrooveSharp')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Charlie Brown Jr.' })).toBeInTheDocument()
  expect(screen.getByText('Pipeline')).toBeInTheDocument()
})

test('avaliar uma música registra o treino e atualiza a saúde', async () => {
  const user = userEvent.setup()
  render(<App />)

  // primeira música ainda não praticada
  const dots = screen.getAllByTitle('Ainda não praticada — toque pra registrar')
  await user.click(dots[0])

  // escolhe "Mandei bem" no popover
  await user.click(screen.getByRole('button', { name: /Mandei bem/ }))

  // o registro aparece: a bolinha agora reflete a avaliação de agora
  expect(screen.getByTitle(/Mandei bem · agora/)).toBeInTheDocument()
})

test('busca filtra as músicas', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByPlaceholderText('Buscar música…'), 'quebra')
  const list = screen.getByRole('list')
  expect(within(list).getByText('Quebra-Mar')).toBeInTheDocument()
  expect(within(list).queryByText('Pipeline')).not.toBeInTheDocument()
})
