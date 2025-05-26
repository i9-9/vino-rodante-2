import Link from "next/link"

export default function AuthCodeError() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="animate-in flex-1 flex flex-col w-full justify-center gap-6 text-foreground">
        <h1 className="text-2xl font-bold">Error de autenticación</h1>
        <p className="text-sm text-gray-500">
          Hubo un error al procesar tu código de autenticación. Esto puede suceder si:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-500">
          <li>El código ha expirado</li>
          <li>El código ya ha sido usado</li>
          <li>El código es inválido</li>
        </ul>
        <Link
          href="/auth/sign-in"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
} 