import { render, screen } from '@testing-library/react'
import App from './App'

test('renderiza o nome do app', () => {
  render(<App />)
  expect(screen.getByText('GrooveSharp')).toBeInTheDocument()
})
