import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { bundle } from '@/lib/esbuild'
import { DynamicComponent } from '@/lib/dynamic-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/')({
  component: App,
})

function ErrorFallback({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>
}

// https://github.com/tailwindlabs/tailwindcss/pull/18292
function App() {
  const [value, setValue] = useState(localStorage.getItem('code') || '')
  const [code, setCode] = useState('')
  const [buildError, setBuildError] = useState('')
  const [tab, setTab] = useState('component')

  useEffect(() => {
    ;(async () => {
      try {
        const code = await bundle(value)
        setCode(code)
        setBuildError('')
      } catch (e: any) {
        setBuildError(e?.message || 'Unknown Error')
      }
    })()
  }, [value])

  useEffect(() => {
    localStorage.setItem('code', value)
  }, [value])

  return (
    <ResizablePanelGroup
      className="h-full"
      direction="horizontal"
      autoSaveId="my-panel-group"
    >
      <ResizablePanel minSize={30} defaultSize={50} className="p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-full w-full resize-none bg-transparent border font-mono p-2"
          spellCheck={false}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        minSize={30}
        defaultSize={50}
        className="p-4 font-mono flex flex-col gap-2"
      >
        <div className="flex gap-2 items-center">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="component">Component</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </Tabs>
          {buildError && (
            <span className="text-sm text-muted-foreground">{buildError}</span>
          )}
        </div>
        {tab === 'component' && (
          <div className="flex-1 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {code ? (
                <ErrorBoundary
                  resetKeys={[code]}
                  FallbackComponent={ErrorFallback}
                >
                  <DynamicComponent code={code} />
                </ErrorBoundary>
              ) : (
                <Loader2 className="text-muted-foreground animate-spin size-8" />
              )}
            </div>
          </div>
        )}
        {tab === 'code' && <pre className="whitespace-pre-wrap">{code}</pre>}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
