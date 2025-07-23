'use client'

import { useEffect } from 'react'

export function BodyClassSetter() {
  useEffect(() => {
    document.body.classList.add('expansion-alids-init')
    return () => {
      document.body.classList.remove('expansion-alids-init')
    }
  }, [])

  return null
}
