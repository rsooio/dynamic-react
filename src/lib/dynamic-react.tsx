import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const baseEnv = { React, Button, Input, Label }

export function useDynamicComponent(
  code: string,
  env: Record<string, any> | null = null,
): React.FC<any> {
  return React.useMemo(() => {
    env = { ...baseEnv, ...env }
    return new Function(...Object.keys(env), code)(...Object.values(env))
  }, [code, env])
}

export function DynamicComponent(props: {
  code: string
  env?: Record<string, any>
  [key: string]: any
}) {
  const { code, env, ...rest } = props
  const Component = useDynamicComponent(code, env)
  return <Component {...rest} />
}
