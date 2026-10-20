import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'

/**
 * Re-render a movie set only when its scripted state changes: `fn(t)` returns plain data
 * (coefficients, which complex, …); `children(state)` draws it. Continuous motion belongs in
 * useFrame; this is for the discrete beats.
 */
export default function Timed({ tRef, fn, children }) {
  const [v, setV] = useState(() => fn(tRef.current))
  const key = useRef(JSON.stringify(v))
  useFrame(() => {
    const n = fn(tRef.current)
    const s = JSON.stringify(n)
    if (s !== key.current) {
      key.current = s
      setV(n)
    }
  })
  return children(v)
}
