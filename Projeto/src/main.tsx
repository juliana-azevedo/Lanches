import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { MainProvider } from './contexts/mainContext.tsx'
import { UserProvider } from './contexts/userContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <MainProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MainProvider>
    </UserProvider>
  </StrictMode>,
)
