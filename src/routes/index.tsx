import { createFileRoute } from '@tanstack/react-router'
import { ErrorBoundary } from 'react-error-boundary'
import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
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

const css = `
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

body,
html,
#app {
  @apply h-full w-full;
}

body {
  @apply m-0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family:
    source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`

export const Route = createFileRoute('/')({
  component: App,
})

function ErrorFallback({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>
}

function App() {
  const [value, setValue] = useState(localStorage.getItem('code') || '')
  const [code, setCode] = useState('')
  const [buildError, setBuildError] = useState('')
  const [tab, setTab] = useState('component')
  const styleRef = useRef<HTMLStyleElement>(null)

  useEffect(() => {
    styleRef.current ??= document.createElement('style')
    document.head.appendChild(styleRef.current)
    return () => {
      document.head.removeChild(styleRef.current!)
    }
  })

  useEffect(() => {
    ;(async () => {
      try {
        const code = await bundle(value)
        const style = await generateTailwindCSS({ css, content: value })
        styleRef.current!.innerHTML = style
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
        <CodeMirror
          value={value}
          onChange={setValue}
          extensions={[javascript({ jsx: true })]}
          className="h-full *:h-full"
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
