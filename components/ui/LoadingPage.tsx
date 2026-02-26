import LoadingSpinner from './LoadingSpinner'

interface Props {
  message?: string
}

export default function LoadingPage({ message = 'Carregando...' }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}
