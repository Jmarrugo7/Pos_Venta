import { redirect } from 'next/navigation'

export default function Home() {
  // Apenas se renderiza la raíz, redirige al login
  redirect('/auth/login')
}
