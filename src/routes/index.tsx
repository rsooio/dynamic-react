import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect, useState } from 'react'
import { Check, Copy, Loader2 } from 'lucide-react'
import { generateTailwindCSS } from 'tailwindcss-iso'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { bundle } from '@/lib/esbuild'
import { DynamicComponent } from '@/lib/dynamic-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: App,
})

function ErrorFallback({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>
}

function App() {
  const [value, setValue] = useState(localStorage.getItem('code') || '')
  const [code, setCode] = useState('')
  const [style, setStyle] = useState('')
  const [buildError, setBuildError] = useState('')
  const [tab, setTab] = useState('component')
  const [minify, setMinify] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const code = await bundle(value, { minify })
        const style = await generateTailwindCSS({ content: code })
        setCode(code)
        setStyle(style)
        setBuildError('')
      } catch (e: any) {
        setBuildError(e?.message || 'Unknown Error')
      }
    })()
  }, [value, minify])

  useEffect(() => {
    localStorage.setItem('code', value)
  }, [value])

  return (
    <ResizablePanelGroup
      className="h-full"
      direction="horizontal"
      autoSaveId="my-panel-group"
    >
      <ResizablePanel minSize={30} defaultSize={50}>
        <CodeMirror
          value={value}
          onChange={setValue}
          extensions={[javascript({ jsx: true })]}
          className="h-full *:h-full"
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={30}
        defaultSize={50}
        className="p-4 font-mono flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="component">Component</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
            </Tabs>
            {buildError && (
              <span className="text-sm text-muted-foreground">
                {buildError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'code' && (
              <label className="text-sm flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={minify}
                  onChange={(e) => setMinify(e.target.checked)}
                />
                Minify
              </label>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(code)
                setCopied(true)
                setTimeout(() => setCopied(false), 5000)
              }}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
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
        {tab === 'code' && (
          <div className="break-all whitespace-pre-wrap overflow-auto">
            {code}
          </div>
        )}
        {tab === 'style' && (
          <div className="whitespace-pre-wrap overflow-auto">{style}</div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
