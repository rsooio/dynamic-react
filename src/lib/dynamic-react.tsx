import React, {
  createContext,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react'
import { generateTailwindCSS } from 'tailwindcss-iso'
import { ErrorBoundary } from 'react-error-boundary'
import * as LUCIDE from 'lucide-react'
import { cn } from './utils'
import type { FallbackProps } from 'react-error-boundary'

const flatten = (obj: Record<string, any>, n = 1) =>
  n ? Object.fromEntries(Object.values(obj).flatMap(Object.entries)) : obj

const SHADCN = flatten(import.meta.glob('@/components/ui/*', { eager: true }))

const baseEnv = { React, ...React, SHADCN, ...SHADCN, LUCIDE, cn }

type ContextProps = {
  addCode: (id: string, code: string) => void
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

  const addCode = useCallback((id: string, code: string) => {
    setCodes((prev) => ({ ...prev, [id]: code }))
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
  const id = useId()
  const context = React.useContext(DynamicComponentContext)
  if (!context) {
    throw new Error(
      'useDynamicComponent must be used within a DynamicComponentProvider',
    )
  }

  const { addCode, delCode } = context

  useEffect(() => {
    addCode(id, code)
    return () => delCode(id)
  }, [id, code, addCode, delCode])

  return React.useMemo(() => {
    env = { ...baseEnv, ...env }
    return new Function(...Object.keys(env), code)(...Object.values(env))
  }, [code, env])
}

const ErrorFallback: React.ComponentType<FallbackProps> = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-red-500">
        <p>Something went wrong</p>
      </div>
    </div>
  )
}

function DynamicComponentInner(props: {
  code: string
  env?: Record<string, any>
  [key: string]: any
}) {
  const { code, env, ...rest } = props
  const Component = useDynamicComponent(code, env)

  return <Component {...rest} />
}

export function DynamicComponent(props: {
  code: string
  env?: Record<string, any>
  [key: string]: any
}) {
  const { code, env, ...rest } = props

  return (
    <ErrorBoundary resetKeys={[code]} FallbackComponent={ErrorFallback}>
      <DynamicComponentInner code={code} env={env} {...rest} />
    </ErrorBoundary>
  )
}
