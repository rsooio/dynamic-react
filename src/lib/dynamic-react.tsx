import React, { createContext, useCallback, useEffect, useRef } from 'react'
import { generateTailwindCSS } from 'tailwindcss-iso'
import { ErrorBoundary } from 'react-error-boundary'
import * as SHADCN from '@/lib/shadcn'
import * as LUCIDE from 'lucide-react'

const baseEnv = { React, ...React, SHADCN, ...SHADCN, LUCIDE }

type ContextProps = {
  addCode: (code: string) => string
  delCode: (id: string) => void
}

const DynamicComponentContext = createContext<ContextProps | null>(null)

export function DynamicComponentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [codes, setCodes] = React.useState<Record<string, string>>({})
  const styleRef = useRef<HTMLStyleElement>(null)

  useEffect(() => {
    const style = document.createElement('style')
    style.id = '_dynamic_react_style'
    styleRef.current = style
    document.head.insertBefore(style, document.head.firstChild)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const content = Object.values(codes).join('\n')
      const style = await generateTailwindCSS({ content })
      styleRef.current!.textContent = style
    })()
  }, [codes])

  const addCode = useCallback((code: string) => {
    const id = crypto.randomUUID()
    setCodes((prev) => ({ ...prev, [id]: code }))
    return id
  }, [])

  const delCode = useCallback((id: string) => {
    setCodes((prev) => {
      const newCodes = { ...prev }
      delete newCodes[id]
      return newCodes
    })
  }, [])

  return (
    <DynamicComponentContext.Provider value={{ addCode, delCode }}>
      {children}
    </DynamicComponentContext.Provider>
  )
}

export function useDynamicComponent(
  code: string,
  env: Record<string, any> | null = null,
): React.FC<any> {
  const context = React.useContext(DynamicComponentContext)
  if (!context) {
    throw new Error(
      'useDynamicComponent must be used within a DynamicComponentProvider',
    )
  }

  const { addCode, delCode } = context

  useEffect(() => {
    const id = addCode(code)
    return () => delCode(id)
  }, [code, addCode, delCode])

  return React.useMemo(() => {
    env = { ...baseEnv, ...env }
    return new Function(...Object.keys(env), code)(...Object.values(env))
  }, [code, env])
}

const ErrorFallback = ({}: { error: Error }) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-red-500">
        <p>Something went wrong</p>
      </div>
    </div>
  )
}

export function DynamicComponent(props: {
  code: string
  env?: Record<string, any>
  [key: string]: any
}) {
  const { code, env, ...rest } = props
  const Component = useDynamicComponent(code, env)

  return (
    <ErrorBoundary resetKeys={[code]} FallbackComponent={ErrorFallback}>
      <Component {...rest} />
    </ErrorBoundary>
  )
}
