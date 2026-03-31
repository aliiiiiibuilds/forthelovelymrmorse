'use client'
import { useEffect, useRef, useCallback } from 'react'

type SSEHandler = (data: unknown) => void

export function useSSE(handlers: Record<string, SSEHandler>) {
  const esRef = useRef<EventSource | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close()

    const es = new EventSource('/api/sse')
    esRef.current = es

    Object.keys(handlersRef.current).forEach(event => {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data)
          handlersRef.current[event]?.(data)
        } catch {}
      })
    })

    es.onerror = () => {
      es.close()
      setTimeout(connect, 3000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => { esRef.current?.close() }
  }, [connect])
}
